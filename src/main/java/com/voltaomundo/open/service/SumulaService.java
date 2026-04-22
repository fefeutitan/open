package com.voltaomundo.open.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltaomundo.open.domain.AvaliacaoJuiz;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.domain.Juiz;
import com.voltaomundo.open.domain.LadoCompetidor;
import com.voltaomundo.open.domain.StatusJogo;
import com.voltaomundo.open.domain.Sumula;
import com.voltaomundo.open.repository.AvaliacaoJuizRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.repository.SumulaRepository;
import com.voltaomundo.open.web.dto.AvaliacaoJuizDto;
import com.voltaomundo.open.web.dto.AvaliacaoJuizRequest;
import com.voltaomundo.open.web.dto.SumulaJogoRequest;
import com.voltaomundo.open.web.dto.SumulaJogoResponse;

@Service
public class SumulaService {

    private final EntityLookupService lookupService;
    private final SumulaRepository sumulaRepository;
    private final AvaliacaoJuizRepository avaliacaoJuizRepository;
    private final JogoRepository jogoRepository;

    public SumulaService(EntityLookupService lookupService,
            SumulaRepository sumulaRepository,
            AvaliacaoJuizRepository avaliacaoJuizRepository,
            JogoRepository jogoRepository) {
        this.lookupService = lookupService;
        this.sumulaRepository = sumulaRepository;
        this.avaliacaoJuizRepository = avaliacaoJuizRepository;
        this.jogoRepository = jogoRepository;
    }

    @Transactional(readOnly = true)
    public SumulaJogoResponse buscarPorJogo(Long jogoId) {
        Jogo jogo = lookupService.jogo(jogoId);
        Sumula sumula = sumulaRepository.findByJogoId(jogoId)
                .orElseThrow(() -> new IllegalArgumentException("Sumula nao encontrada para o jogo: " + jogoId));

        List<AvaliacaoJuiz> avaliacoes = avaliacaoJuizRepository.findBySumulaId(sumula.getId());
        return toResponse(sumula, jogo, avaliacoes);
    }

    @Transactional
    public SumulaJogoResponse registrar(Long jogoId, SumulaJogoRequest request) {
        Jogo jogo = lookupService.jogo(jogoId);
        if (request.avaliacoes() == null || request.avaliacoes().size() != 3) {
            throw new IllegalArgumentException("A sumula precisa conter exatamente 3 avaliacoes.");
        }

        Set<Long> juizIds = new HashSet<>();
        List<AvaliacaoJuizBuilder> avaliacoesPreparadas = new ArrayList<>();
        int totalVermelho = 0;
        int totalAzul = 0;
        int votosVermelho = 0;
        int votosAzul = 0;

        for (AvaliacaoJuizRequest avaliacaoRequest : request.avaliacoes()) {
            if (!juizIds.add(avaliacaoRequest.juizId())) {
                throw new IllegalArgumentException("Cada avaliacao precisa usar um juiz diferente.");
            }

            if (avaliacaoRequest.pontosVermelho().equals(avaliacaoRequest.pontosAzul())) {
                throw new IllegalArgumentException("Cada avaliacao precisa indicar um vencedor.");
            }

            Juiz juiz = lookupService.juiz(avaliacaoRequest.juizId());
            Long campeonatoJuizId = juiz.getCampeonato().getId();
            Long campeonatoJogoId = jogo.getFase().getCampeonato().getId();
            if (!campeonatoJuizId.equals(campeonatoJogoId)) {
                throw new IllegalArgumentException("Todos os juizes devem pertencer ao mesmo campeonato do jogo.");
            }

            totalVermelho += avaliacaoRequest.pontosVermelho();
            totalAzul += avaliacaoRequest.pontosAzul();
            if (avaliacaoRequest.pontosVermelho() > avaliacaoRequest.pontosAzul()) {
                votosVermelho++;
            } else {
                votosAzul++;
            }

            avaliacoesPreparadas.add(new AvaliacaoJuizBuilder(juiz, avaliacaoRequest));
        }

        LadoCompetidor vencedor = votosVermelho > votosAzul ? LadoCompetidor.VERMELHO : LadoCompetidor.AZUL;

        Sumula sumula = sumulaRepository.findByJogoId(jogoId).orElseGet(() -> {
            Sumula nova = new Sumula();
            nova.setJogo(jogo);
            return nova;
        });
        sumula.setObservacoes(request.observacoes());
        sumula = sumulaRepository.save(sumula);

        avaliacaoJuizRepository.deleteBySumulaId(sumula.getId());
        List<AvaliacaoJuiz> avaliacoesSalvas = new ArrayList<>();
        for (AvaliacaoJuizBuilder builder : avaliacoesPreparadas) {
            AvaliacaoJuiz avaliacao = new AvaliacaoJuiz();
            avaliacao.setSumula(sumula);
            avaliacao.setJuiz(builder.juiz());
            avaliacao.setPontosVermelho(builder.request().pontosVermelho());
            avaliacao.setPontosAzul(builder.request().pontosAzul());
            avaliacao.setObservacoes(builder.request().observacoes());
            avaliacoesSalvas.add(avaliacaoJuizRepository.save(avaliacao));
        }

        jogo.setPontosVermelho(totalVermelho);
        jogo.setPontosAzul(totalAzul);
        jogo.setVencedor(vencedor);
        jogo.setStatus(StatusJogo.FINALIZADO);
        jogoRepository.save(jogo);

        return toResponse(sumula, jogo, avaliacoesSalvas);
    }

    private SumulaJogoResponse toResponse(Sumula sumula, Jogo jogo, List<AvaliacaoJuiz> avaliacoes) {
        List<AvaliacaoJuizDto> avaliacoesDto = avaliacoes.stream()
                .map(avaliacao -> new AvaliacaoJuizDto(
                        avaliacao.getId(),
                        avaliacao.getJuiz().getId(),
                        avaliacao.getJuiz().getNome(),
                        avaliacao.getPontosVermelho(),
                        avaliacao.getPontosAzul(),
                        avaliacao.getObservacoes()))
                .toList();

        return new SumulaJogoResponse(
                sumula.getId(),
                jogo.getId(),
                sumula.getObservacoes(),
                jogo.getPontosVermelho(),
                jogo.getPontosAzul(),
                jogo.getVencedor(),
                jogo.getStatus(),
                avaliacoesDto);
    }

    private record AvaliacaoJuizBuilder(Juiz juiz, AvaliacaoJuizRequest request) {
    }
}
