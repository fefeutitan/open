package com.voltaomundo.open.web;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.voltaomundo.open.domain.Fase;
import com.voltaomundo.open.domain.Grupo;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.repository.FaseRepository;
import com.voltaomundo.open.repository.GrupoRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.service.CompeticaoService;
import com.voltaomundo.open.web.dto.ClassificacaoAtletaDto;
import com.voltaomundo.open.web.dto.FaseRequest;
import com.voltaomundo.open.web.dto.GeracaoMataMataRequest;
import com.voltaomundo.open.web.dto.GrupoRequest;
import com.voltaomundo.open.web.dto.JogoRequest;
import com.voltaomundo.open.web.dto.ResultadoJogoRequest;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/competicao")
public class CompeticaoController {

    private final FaseRepository faseRepository;
    private final GrupoRepository grupoRepository;
    private final JogoRepository jogoRepository;
    private final CompeticaoService competicaoService;

    public CompeticaoController(FaseRepository faseRepository,
            GrupoRepository grupoRepository,
            JogoRepository jogoRepository,
            CompeticaoService competicaoService) {
        this.faseRepository = faseRepository;
        this.grupoRepository = grupoRepository;
        this.jogoRepository = jogoRepository;
        this.competicaoService = competicaoService;
    }

    @GetMapping("/fases")
    public List<Fase> listarFases(@RequestParam(required = false) Long campeonatoId) {
        return campeonatoId == null ? faseRepository.findAll() : faseRepository.findByCampeonatoIdOrderByOrdemAsc(campeonatoId);
    }

    @PostMapping("/fases")
    public Fase criarFase(@Valid @RequestBody FaseRequest request) {
        return competicaoService.criarFase(request);
    }

    @GetMapping("/grupos")
    public List<Grupo> listarGrupos(@RequestParam(required = false) Long faseId) {
        return faseId == null ? grupoRepository.findAll() : grupoRepository.findByFaseId(faseId);
    }

    @PostMapping("/grupos")
    public Grupo criarGrupo(@Valid @RequestBody GrupoRequest request) {
        return competicaoService.criarGrupo(request);
    }

    @GetMapping("/grupos/{grupoId}/classificacao")
    public List<ClassificacaoAtletaDto> classificarGrupo(@PathVariable Long grupoId) {
        return competicaoService.classificarGrupo(grupoId);
    }

    @GetMapping("/jogos")
    public List<Jogo> listarJogos(@RequestParam(required = false) Long campeonatoId) {
        return campeonatoId == null ? jogoRepository.findAll() : jogoRepository.findByFaseCampeonatoId(campeonatoId);
    }

    @PostMapping("/jogos")
    public Jogo criarJogo(@Valid @RequestBody JogoRequest request) {
        return competicaoService.criarJogo(request);
    }

    @PatchMapping("/jogos/{jogoId}/resultado")
    public Jogo registrarResultado(@PathVariable Long jogoId, @Valid @RequestBody ResultadoJogoRequest request) {
        return competicaoService.registrarResultado(jogoId, request);
    }

    @PostMapping("/fases/{faseGruposId}/gerar-mata-mata")
    public List<Jogo> gerarMataMata(@PathVariable Long faseGruposId,
            @Valid @RequestBody GeracaoMataMataRequest request) {
        return competicaoService.gerarMataMata(faseGruposId, request.faseEliminatoriaId());
    }
}
