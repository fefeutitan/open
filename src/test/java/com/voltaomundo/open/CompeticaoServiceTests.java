package com.voltaomundo.open;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.voltaomundo.open.domain.Atleta;
import com.voltaomundo.open.domain.Campeonato;
import com.voltaomundo.open.domain.Categoria;
import com.voltaomundo.open.domain.CorrecaoJogo;
import com.voltaomundo.open.domain.Fase;
import com.voltaomundo.open.domain.GeneroCategoria;
import com.voltaomundo.open.domain.Grupo;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.domain.LadoCompetidor;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.domain.StatusCampeonato;
import com.voltaomundo.open.domain.StatusJogo;
import com.voltaomundo.open.domain.StatusAtleta;
import com.voltaomundo.open.domain.TipoCorrecaoJogo;
import com.voltaomundo.open.domain.TipoFase;
import com.voltaomundo.open.exception.BusinessRuleViolationException;
import com.voltaomundo.open.exception.StateConflictException;
import com.voltaomundo.open.repository.AtletaRepository;
import com.voltaomundo.open.repository.CampeonatoRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.CorrecaoJogoRepository;
import com.voltaomundo.open.repository.FaseRepository;
import com.voltaomundo.open.repository.GrupoRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.repository.NucleoRepository;
import com.voltaomundo.open.service.CompeticaoService;
import com.voltaomundo.open.web.dto.ClassificacaoAtletaDto;
import com.voltaomundo.open.web.dto.JogoRequest;
import com.voltaomundo.open.web.dto.ResultadoJogoRequest;

@SpringBootTest
class CompeticaoServiceTests {

    @Autowired
    private CompeticaoService competicaoService;

    @Autowired
    private CampeonatoRepository campeonatoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private NucleoRepository nucleoRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private GrupoRepository grupoRepository;

    @Autowired
    private JogoRepository jogoRepository;

    @Autowired
    private CorrecaoJogoRepository correcaoJogoRepository;

    @Test
    void deveClassificarGrupoEGerarMataMata() {
        Campeonato campeonato = new Campeonato();
        campeonato.setNome("Open VM");
        campeonato.setLocal("Fortaleza");
        campeonato.setStatus(StatusCampeonato.CONFIGURADO);
        campeonato = campeonatoRepository.save(campeonato);

        Categoria categoria = new Categoria();
        categoria.setCampeonato(campeonato);
        categoria.setNome("Adulto");
        categoria.setGenero(GeneroCategoria.MASCULINO);
        categoria = categoriaRepository.save(categoria);

        Nucleo nucleo = new Nucleo();
        nucleo.setCampeonato(campeonato);
        nucleo.setNome("Núcleo A");
        nucleo = nucleoRepository.save(nucleo);

        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);
        Atleta atleta3 = atleta("Atleta 3", categoria, nucleo);
        Atleta atleta4 = atleta("Atleta 4", categoria, nucleo);

        Fase grupos = new Fase();
        grupos.setCampeonato(campeonato);
        grupos.setNome("Grupos");
        grupos.setTipo(TipoFase.GRUPOS);
        grupos.setOrdem(1);
        grupos.setClassificadosPorGrupo(2);
        grupos = faseRepository.save(grupos);

        Fase eliminatoria = new Fase();
        eliminatoria.setCampeonato(campeonato);
        eliminatoria.setNome("Semifinal");
        eliminatoria.setTipo(TipoFase.ELIMINATORIA);
        eliminatoria.setOrdem(2);
        eliminatoria = faseRepository.save(eliminatoria);

        Grupo grupoA = new Grupo();
        grupoA.setNome("A");
        grupoA.setFase(grupos);
        grupoA = grupoRepository.save(grupoA);

        Grupo grupoB = new Grupo();
        grupoB.setNome("B");
        grupoB.setFase(grupos);
        grupoB = grupoRepository.save(grupoB);

        jogo(grupos, grupoA, categoria, atleta1, atleta2, 10, 5, LadoCompetidor.VERMELHO);
        jogo(grupos, grupoB, categoria, atleta3, atleta4, 7, 3, LadoCompetidor.VERMELHO);

        List<ClassificacaoAtletaDto> classificacaoA = competicaoService.classificarGrupo(grupoA.getId());
        assertThat(classificacaoA).hasSize(2);
        assertThat(classificacaoA.get(0).atletaNome()).isEqualTo("Atleta 1");
        assertThat(classificacaoA.get(0).pontosClassificacao()).isEqualTo(3);

        List<Jogo> mataMata = competicaoService.gerarMataMata(grupos.getId(), eliminatoria.getId());
        assertThat(mataMata).hasSize(2);
        assertThat(mataMata)
                .extracting(j -> j.getFase().getId())
                .containsOnly(eliminatoria.getId());
    }

    @Test
    void devePontuarEmpateNaFaseDeGrupos() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");

        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);

        Fase grupos = fase(campeonato, "Grupos", TipoFase.GRUPOS, 1, 2);
        Grupo grupoA = grupo(grupos, "A");

        Jogo empate = jogoAgendado(grupos, grupoA, categoria, atleta1, atleta2);

        competicaoService.iniciarJogo(empate.getId());
        competicaoService.registrarResultado(
                empate.getId(),
                new ResultadoJogoRequest(10, 10, null));

        List<ClassificacaoAtletaDto> classificacao = competicaoService.classificarGrupo(grupoA.getId());
        assertThat(classificacao).hasSize(2);
        assertThat(classificacao)
                .extracting(ClassificacaoAtletaDto::pontosClassificacao)
                .containsOnly(1);
    }

    @Test
    void deveGerarJogoDesempateAoEmpatarNaEliminatoria() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");

        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);

        Fase eliminatoria = fase(campeonato, "Quartas", TipoFase.ELIMINATORIA, 1, null);
        Jogo jogoEliminatorio = jogoAgendado(eliminatoria, null, categoria, atleta1, atleta2);

        competicaoService.iniciarJogo(jogoEliminatorio.getId());
        competicaoService.registrarResultado(
                jogoEliminatorio.getId(),
                new ResultadoJogoRequest(10, 10, null));

        List<Jogo> jogos = jogoRepository.findByFaseId(eliminatoria.getId());
        assertThat(jogos).hasSize(2);
        assertThat(jogos)
                .filteredOn(jogo -> jogo.getId().equals(jogoEliminatorio.getId()))
                .singleElement()
                .satisfies(jogo -> {
                    assertThat(jogo.getStatus()).isEqualTo(StatusJogo.FINALIZADO);
                    assertThat(jogo.getVencedor()).isNull();
                });

        assertThat(jogos)
                .filteredOn(jogo -> !jogo.getId().equals(jogoEliminatorio.getId()))
                .singleElement()
                .satisfies(jogo -> {
                    assertThat(jogo.getStatus()).isEqualTo(StatusJogo.AGENDADO);
                    assertThat(jogo.getAtletaVermelho().getId()).isEqualTo(atleta1.getId());
                    assertThat(jogo.getAtletaAzul().getId()).isEqualTo(atleta2.getId());
                });
    }

    @Test
    void deveIniciarJogoAgendado() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");
        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);
        Fase eliminatoria = fase(campeonato, "Quartas", TipoFase.ELIMINATORIA, 1, null);
        Jogo jogo = jogoAgendado(eliminatoria, null, categoria, atleta1, atleta2);

        Jogo iniciado = competicaoService.iniciarJogo(jogo.getId());

        assertThat(iniciado.getStatus()).isEqualTo(StatusJogo.EM_ANDAMENTO);
    }

    @Test
    void deveRejeitarResultadoForaDeJogoEmAndamento() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");
        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);
        Fase eliminatoria = fase(campeonato, "Quartas", TipoFase.ELIMINATORIA, 1, null);
        Jogo jogo = jogoAgendado(eliminatoria, null, categoria, atleta1, atleta2);

        assertThatThrownBy(() -> competicaoService.registrarResultado(
                jogo.getId(),
                new ResultadoJogoRequest(10, 8, LadoCompetidor.VERMELHO)))
                .isInstanceOf(StateConflictException.class)
                .hasMessageContaining("em andamento");

        competicaoService.iniciarJogo(jogo.getId());
        competicaoService.registrarResultado(jogo.getId(), new ResultadoJogoRequest(10, 8, LadoCompetidor.VERMELHO));

        assertThatThrownBy(() -> competicaoService.registrarResultado(
                jogo.getId(),
                new ResultadoJogoRequest(10, 8, LadoCompetidor.VERMELHO)))
                .isInstanceOf(StateConflictException.class)
                .hasMessageContaining("em andamento");
    }

    @Test
    void deveRejeitarCriacaoDeJogoComAtletasDaCategoriaErrada() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria adulto = categoria(campeonato, "Adulto");
        Categoria juvenil = categoria(campeonato, "Juvenil");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");
        Atleta atleta1 = atleta("Atleta 1", adulto, nucleo);
        Atleta atleta2 = atleta("Atleta 2", juvenil, nucleo);
        Fase fase = fase(campeonato, "Grupos", TipoFase.GRUPOS, 1, 2);

        assertThatThrownBy(() -> competicaoService.criarJogo(
                new JogoRequest(fase.getId(), null, adulto.getId(), atleta1.getId(), atleta2.getId(), null)))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("categoria informada");
    }

    @Test
    void deveRejeitarCriacaoDeJogoComGrupoDeOutraFase() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");
        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);
        Fase faseA = fase(campeonato, "Grupos A", TipoFase.GRUPOS, 1, 2);
        Fase faseB = fase(campeonato, "Grupos B", TipoFase.GRUPOS, 2, 2);
        Grupo grupoDeOutraFase = grupo(faseB, "B");

        assertThatThrownBy(() -> competicaoService.criarJogo(
                new JogoRequest(
                        faseA.getId(),
                        grupoDeOutraFase.getId(),
                        categoria.getId(),
                        atleta1.getId(),
                        atleta2.getId(),
                        null)))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("Grupo precisa pertencer");
    }

    @Test
    void deveRejeitarCriacaoDeJogoComMesmoAtletaNosDoisLados() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");
        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Fase fase = fase(campeonato, "Grupos", TipoFase.GRUPOS, 1, 2);

        assertThatThrownBy(() -> competicaoService.criarJogo(
                new JogoRequest(fase.getId(), null, categoria.getId(), atleta1.getId(), atleta1.getId(), null)))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("dois atletas diferentes");
    }

    @Test
    void deveCorrigirResultadoFinalizadoComAuditoria() {
        Campeonato campeonato = campeonato("Open VM");
        Categoria categoria = categoria(campeonato, "Adulto");
        Nucleo nucleo = nucleo(campeonato, "Nucleo A");
        Atleta atleta1 = atleta("Atleta 1", categoria, nucleo);
        Atleta atleta2 = atleta("Atleta 2", categoria, nucleo);
        Fase eliminatoria = fase(campeonato, "Quartas", TipoFase.ELIMINATORIA, 1, null);
        Jogo jogo = jogo(eliminatoria, null, categoria, atleta1, atleta2, 10, 8, LadoCompetidor.VERMELHO);

        CorrecaoJogo correcao = competicaoService.corrigirResultado(
                jogo.getId(),
                "Erro de digitacao na pontuacao",
                new ResultadoJogoRequest(7, 9, LadoCompetidor.AZUL));

        Jogo jogoAtualizado = jogoRepository.findById(jogo.getId()).orElseThrow();
        assertThat(jogoAtualizado.getStatus()).isEqualTo(StatusJogo.FINALIZADO);
        assertThat(jogoAtualizado.getPontosVermelho()).isEqualTo(7);
        assertThat(jogoAtualizado.getPontosAzul()).isEqualTo(9);
        assertThat(jogoAtualizado.getVencedor()).isEqualTo(LadoCompetidor.AZUL);

        assertThat(correcao.getTipo()).isEqualTo(TipoCorrecaoJogo.RESULTADO);
        assertThat(correcao.getMotivo()).contains("digitacao");
        assertThat(correcao.getDetalheAnterior()).contains("pontosVermelho=10");
        assertThat(correcao.getDetalheNovo()).contains("pontosAzul=9");
        assertThat(correcaoJogoRepository.findByJogoIdOrderByCriadoEmAsc(jogo.getId())).hasSize(1);
    }

    private Campeonato campeonato(String nome) {
        Campeonato campeonato = new Campeonato();
        campeonato.setNome(nome);
        campeonato.setLocal("Fortaleza");
        campeonato.setStatus(StatusCampeonato.CONFIGURADO);
        return campeonatoRepository.save(campeonato);
    }

    private Categoria categoria(Campeonato campeonato, String nome) {
        Categoria categoria = new Categoria();
        categoria.setCampeonato(campeonato);
        categoria.setNome(nome);
        categoria.setGenero(GeneroCategoria.MASCULINO);
        return categoriaRepository.save(categoria);
    }

    private Nucleo nucleo(Campeonato campeonato, String nome) {
        Nucleo nucleo = new Nucleo();
        nucleo.setCampeonato(campeonato);
        nucleo.setNome(nome);
        return nucleoRepository.save(nucleo);
    }

    private Fase fase(Campeonato campeonato, String nome, TipoFase tipo, int ordem, Integer classificadosPorGrupo) {
        Fase fase = new Fase();
        fase.setCampeonato(campeonato);
        fase.setNome(nome);
        fase.setTipo(tipo);
        fase.setOrdem(ordem);
        fase.setClassificadosPorGrupo(classificadosPorGrupo);
        return faseRepository.save(fase);
    }

    private Grupo grupo(Fase fase, String nome) {
        Grupo grupo = new Grupo();
        grupo.setNome(nome);
        grupo.setFase(fase);
        return grupoRepository.save(grupo);
    }

    private Atleta atleta(String nome, Categoria categoria, Nucleo nucleo) {
        Atleta atleta = new Atleta();
        atleta.setNome(nome);
        atleta.setStatus(StatusAtleta.ATIVO);
        atleta.setCategoria(categoria);
        atleta.setNucleo(nucleo);
        return atletaRepository.save(atleta);
    }

    private Jogo jogo(Fase fase, Grupo grupo, Categoria categoria, Atleta vermelho, Atleta azul,
            int pontosVermelho, int pontosAzul, LadoCompetidor vencedor) {
        Jogo jogo = new Jogo();
        jogo.setFase(fase);
        jogo.setGrupo(grupo);
        jogo.setCategoria(categoria);
        jogo.setAtletaVermelho(vermelho);
        jogo.setAtletaAzul(azul);
        jogo.setPontosVermelho(pontosVermelho);
        jogo.setPontosAzul(pontosAzul);
        jogo.setVencedor(vencedor);
        jogo.setStatus(StatusJogo.FINALIZADO);
        return jogoRepository.save(jogo);
    }

    private Jogo jogoAgendado(Fase fase, Grupo grupo, Categoria categoria, Atleta vermelho, Atleta azul) {
        Jogo jogo = new Jogo();
        jogo.setFase(fase);
        jogo.setGrupo(grupo);
        jogo.setCategoria(categoria);
        jogo.setAtletaVermelho(vermelho);
        jogo.setAtletaAzul(azul);
        return jogoRepository.save(jogo);
    }
}
