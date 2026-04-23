package com.voltaomundo.open.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltaomundo.open.domain.Atleta;
import com.voltaomundo.open.domain.Fase;
import com.voltaomundo.open.domain.Grupo;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.domain.LadoCompetidor;
import com.voltaomundo.open.domain.StatusJogo;
import com.voltaomundo.open.domain.TipoFase;
import com.voltaomundo.open.repository.FaseRepository;
import com.voltaomundo.open.repository.GrupoRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.web.dto.ClassificacaoAtletaDto;
import com.voltaomundo.open.web.dto.FaseRequest;
import com.voltaomundo.open.web.dto.GrupoRequest;
import com.voltaomundo.open.web.dto.JogoRequest;
import com.voltaomundo.open.web.dto.ResultadoJogoRequest;

@Service
public class CompeticaoService {

    private final FaseRepository faseRepository;
    private final GrupoRepository grupoRepository;
    private final JogoRepository jogoRepository;
    private final EntityLookupService lookupService;

    public CompeticaoService(FaseRepository faseRepository,
            GrupoRepository grupoRepository,
            JogoRepository jogoRepository,
            EntityLookupService lookupService) {
        this.faseRepository = faseRepository;
        this.grupoRepository = grupoRepository;
        this.jogoRepository = jogoRepository;
        this.lookupService = lookupService;
    }

    public Fase criarFase(FaseRequest request) {
        Fase fase = new Fase();
        fase.setCampeonato(lookupService.campeonato(request.campeonatoId()));
        fase.setNome(request.nome());
        fase.setTipo(request.tipo());
        fase.setOrdem(request.ordem());
        fase.setClassificadosPorGrupo(request.classificadosPorGrupo());
        return faseRepository.save(fase);
    }

    public Grupo criarGrupo(GrupoRequest request) {
        Grupo grupo = new Grupo();
        grupo.setNome(request.nome());
        grupo.setFase(lookupService.fase(request.faseId()));
        return grupoRepository.save(grupo);
    }

    public Jogo criarJogo(JogoRequest request) {
        Jogo jogo = new Jogo();
        jogo.setFase(lookupService.fase(request.faseId()));
        jogo.setGrupo(request.grupoId() == null ? null : lookupService.grupo(request.grupoId()));
        jogo.setCategoria(lookupService.categoria(request.categoriaId()));
        jogo.setAtletaVermelho(lookupService.atleta(request.atletaVermelhoId()));
        jogo.setAtletaAzul(lookupService.atleta(request.atletaAzulId()));
        jogo.setDataHora(request.dataHora());
        return jogoRepository.save(jogo);
    }

    @Transactional
    public Jogo registrarResultado(Long jogoId, ResultadoJogoRequest request) {
        Jogo jogo = lookupService.jogo(jogoId);
        validarResultadoPorTipoFase(jogo, request);
        jogo.setPontosVermelho(request.pontosVermelho());
        jogo.setPontosAzul(request.pontosAzul());
        jogo.setVencedor(request.vencedor());
        jogo.setStatus(StatusJogo.FINALIZADO);
        Jogo jogoSalvo = jogoRepository.save(jogo);

        if (deveCriarJogoDesempate(jogoSalvo)) {
            criarJogoDesempateSeNecessario(jogoSalvo);
        }

        return jogoSalvo;
    }

    @Transactional(readOnly = true)
    public List<ClassificacaoAtletaDto> classificarGrupo(Long grupoId) {
        Grupo grupo = lookupService.grupo(grupoId);
        List<Jogo> jogos = jogoRepository.findByGrupoId(grupoId);
        return calcularClassificacao(jogos);
    }

    @Transactional
    public List<Jogo> gerarMataMata(Long faseGruposId, Long faseEliminatoriaId) {
        Fase faseGrupos = lookupService.fase(faseGruposId);
        Fase faseEliminatoria = lookupService.fase(faseEliminatoriaId);

        if (faseGrupos.getTipo() != TipoFase.GRUPOS) {
            throw new IllegalArgumentException("A fase de origem precisa ser do tipo GRUPOS.");
        }
        if (faseEliminatoria.getTipo() != TipoFase.ELIMINATORIA) {
            throw new IllegalArgumentException("A fase de destino precisa ser do tipo ELIMINATORIA.");
        }
        if (!faseGrupos.getCampeonato().getId().equals(faseEliminatoria.getCampeonato().getId())) {
            throw new IllegalArgumentException("As fases precisam pertencer ao mesmo campeonato.");
        }
        if (faseGrupos.getClassificadosPorGrupo() == null || faseGrupos.getClassificadosPorGrupo() < 1) {
            throw new IllegalArgumentException("A fase de grupos precisa definir quantos atletas classificam por grupo.");
        }
        if (!jogoRepository.findByFaseId(faseEliminatoriaId).isEmpty()) {
            throw new IllegalArgumentException("A fase eliminatória já possui jogos cadastrados.");
        }

        List<Grupo> grupos = grupoRepository.findByFaseId(faseGruposId);
        List<Atleta> classificados = new ArrayList<>();

        for (Grupo grupo : grupos) {
            List<ClassificacaoAtletaDto> classificacao = classificarGrupo(grupo.getId());
            int limite = Math.min(faseGrupos.getClassificadosPorGrupo(), classificacao.size());
            for (int i = 0; i < limite; i++) {
                classificados.add(lookupService.atleta(classificacao.get(i).atletaId()));
            }
        }

        if (classificados.size() < 2 || classificados.size() % 2 != 0) {
            throw new IllegalArgumentException("A quantidade de classificados precisa ser par e maior que 1.");
        }

        List<Jogo> jogosGerados = new ArrayList<>();
        int metade = classificados.size() / 2;
        for (int i = 0; i < metade; i++) {
            Atleta vermelho = classificados.get(i);
            Atleta azul = classificados.get(classificados.size() - 1 - i);

            Jogo jogo = new Jogo();
            jogo.setFase(faseEliminatoria);
            jogo.setCategoria(vermelho.getCategoria());
            jogo.setAtletaVermelho(vermelho);
            jogo.setAtletaAzul(azul);
            jogosGerados.add(jogoRepository.save(jogo));
        }

        return jogosGerados;
    }

    private List<ClassificacaoAtletaDto> calcularClassificacao(List<Jogo> jogos) {
        Map<Long, EstatisticaAtleta> estatisticas = new LinkedHashMap<>();

        for (Jogo jogo : jogos) {
            registrarParticipante(estatisticas, jogo.getAtletaVermelho());
            registrarParticipante(estatisticas, jogo.getAtletaAzul());

            if (jogo.getStatus() != StatusJogo.FINALIZADO
                    || jogo.getPontosVermelho() == null || jogo.getPontosAzul() == null) {
                continue;
            }

            EstatisticaAtleta vermelho = estatisticas.get(jogo.getAtletaVermelho().getId());
            EstatisticaAtleta azul = estatisticas.get(jogo.getAtletaAzul().getId());

            vermelho.jogos++;
            azul.jogos++;
            vermelho.pontosMarcados += jogo.getPontosVermelho();
            vermelho.pontosSofridos += jogo.getPontosAzul();
            azul.pontosMarcados += jogo.getPontosAzul();
            azul.pontosSofridos += jogo.getPontosVermelho();

            if (jogo.getVencedor() == null) {
                vermelho.pontosClassificacao += 1;
                azul.pontosClassificacao += 1;
            } else if (jogo.getVencedor() == LadoCompetidor.VERMELHO) {
                vermelho.vitorias++;
                vermelho.pontosClassificacao += 3;
                azul.derrotas++;
            } else {
                azul.vitorias++;
                azul.pontosClassificacao += 3;
                vermelho.derrotas++;
            }
        }

        List<EstatisticaAtleta> ordenado = new ArrayList<>(estatisticas.values());
        ordenado.sort(Comparator
                .comparingInt(EstatisticaAtleta::getPontosClassificacao).reversed()
                .thenComparing(Comparator.comparingInt(EstatisticaAtleta::getVitorias).reversed())
                .thenComparing(Comparator.comparingInt(EstatisticaAtleta::saldoPontos).reversed())
                .thenComparing(Comparator.comparingInt(EstatisticaAtleta::getPontosMarcados).reversed())
                .thenComparing(est -> est.nome));

        List<ClassificacaoAtletaDto> resultado = new ArrayList<>();
        for (int i = 0; i < ordenado.size(); i++) {
            EstatisticaAtleta atual = ordenado.get(i);
            resultado.add(new ClassificacaoAtletaDto(
                    atual.atletaId,
                    atual.nome,
                    i + 1,
                    atual.jogos,
                    atual.vitorias,
                    atual.derrotas,
                    atual.pontosClassificacao,
                    atual.pontosMarcados,
                    atual.pontosSofridos,
                    atual.saldoPontos()));
        }
        return resultado;
    }

    private void registrarParticipante(Map<Long, EstatisticaAtleta> estatisticas, Atleta atleta) {
        estatisticas.computeIfAbsent(atleta.getId(), id -> new EstatisticaAtleta(atleta.getId(), atleta.getNome()));
    }

    private void validarResultadoPorTipoFase(Jogo jogo, ResultadoJogoRequest request) {
        boolean empate = request.pontosVermelho().equals(request.pontosAzul());

        if (empate) {
            if (request.vencedor() != null) {
                throw new IllegalArgumentException("Resultado empatado nao pode informar vencedor.");
            }
            return;
        }

        if (request.vencedor() == null) {
            throw new IllegalArgumentException("Resultado com pontuacao diferente precisa informar vencedor.");
        }

        if (request.pontosVermelho() > request.pontosAzul() && request.vencedor() != LadoCompetidor.VERMELHO) {
            throw new IllegalArgumentException("Vencedor informado nao confere com a pontuacao.");
        }
        if (request.pontosAzul() > request.pontosVermelho() && request.vencedor() != LadoCompetidor.AZUL) {
            throw new IllegalArgumentException("Vencedor informado nao confere com a pontuacao.");
        }
    }

    private boolean deveCriarJogoDesempate(Jogo jogo) {
        return jogo.getFase().getTipo() == TipoFase.ELIMINATORIA
                && jogo.getPontosVermelho() != null
                && jogo.getPontosAzul() != null
                && jogo.getPontosVermelho().equals(jogo.getPontosAzul());
    }

    private void criarJogoDesempateSeNecessario(Jogo jogoEmpatado) {
        boolean jaExiste = jogoRepository.findByFaseId(jogoEmpatado.getFase().getId())
                .stream()
                .anyMatch(jogo -> jogo.getStatus() == StatusJogo.AGENDADO
                        && jogo.getPontosVermelho() == null
                        && jogo.getPontosAzul() == null
                        && jogo.getVencedor() == null
                        && mesmosAtletas(jogoEmpatado, jogo));

        if (jaExiste) {
            return;
        }

        Jogo desempate = new Jogo();
        desempate.setFase(jogoEmpatado.getFase());
        desempate.setCategoria(jogoEmpatado.getCategoria());
        desempate.setAtletaVermelho(jogoEmpatado.getAtletaVermelho());
        desempate.setAtletaAzul(jogoEmpatado.getAtletaAzul());
        jogoRepository.save(desempate);
    }

    private boolean mesmosAtletas(Jogo base, Jogo candidato) {
        Long baseVermelhoId = base.getAtletaVermelho().getId();
        Long baseAzulId = base.getAtletaAzul().getId();
        Long candidatoVermelhoId = candidato.getAtletaVermelho().getId();
        Long candidatoAzulId = candidato.getAtletaAzul().getId();

        return (baseVermelhoId.equals(candidatoVermelhoId) && baseAzulId.equals(candidatoAzulId))
                || (baseVermelhoId.equals(candidatoAzulId) && baseAzulId.equals(candidatoVermelhoId));
    }

    private static final class EstatisticaAtleta {
        private final Long atletaId;
        private final String nome;
        private int jogos;
        private int vitorias;
        private int derrotas;
        private int pontosClassificacao;
        private int pontosMarcados;
        private int pontosSofridos;

        private EstatisticaAtleta(Long atletaId, String nome) {
            this.atletaId = atletaId;
            this.nome = nome;
        }

        private int saldoPontos() {
            return pontosMarcados - pontosSofridos;
        }

        private int getPontosMarcados() {
            return pontosMarcados;
        }

        private int getVitorias() {
            return vitorias;
        }

        private int getPontosClassificacao() {
            return pontosClassificacao;
        }
    }
}
