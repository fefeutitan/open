package com.voltaomundo.open;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.voltaomundo.open.domain.Atleta;
import com.voltaomundo.open.domain.Campeonato;
import com.voltaomundo.open.domain.Categoria;
import com.voltaomundo.open.domain.Fase;
import com.voltaomundo.open.domain.GeneroCategoria;
import com.voltaomundo.open.domain.Grupo;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.domain.LadoCompetidor;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.domain.StatusCampeonato;
import com.voltaomundo.open.domain.StatusJogo;
import com.voltaomundo.open.domain.StatusAtleta;
import com.voltaomundo.open.domain.TipoFase;
import com.voltaomundo.open.repository.AtletaRepository;
import com.voltaomundo.open.repository.CampeonatoRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.FaseRepository;
import com.voltaomundo.open.repository.GrupoRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.repository.NucleoRepository;
import com.voltaomundo.open.service.CompeticaoService;
import com.voltaomundo.open.web.dto.ClassificacaoAtletaDto;

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

    private Atleta atleta(String nome, Categoria categoria, Nucleo nucleo) {
        Atleta atleta = new Atleta();
        atleta.setNome(nome);
        atleta.setStatus(StatusAtleta.ATIVO);
        atleta.setCategoria(categoria);
        atleta.setNucleo(nucleo);
        return atletaRepository.save(atleta);
    }

    private void jogo(Fase fase, Grupo grupo, Categoria categoria, Atleta vermelho, Atleta azul,
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
        jogoRepository.save(jogo);
    }
}
