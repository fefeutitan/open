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
import com.voltaomundo.open.domain.Fase;
import com.voltaomundo.open.domain.GeneroCategoria;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.domain.Juiz;
import com.voltaomundo.open.domain.LadoCompetidor;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.domain.StatusAtleta;
import com.voltaomundo.open.domain.StatusCampeonato;
import com.voltaomundo.open.domain.StatusJogo;
import com.voltaomundo.open.domain.TipoFase;
import com.voltaomundo.open.repository.AtletaRepository;
import com.voltaomundo.open.repository.CampeonatoRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.FaseRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.repository.JuizRepository;
import com.voltaomundo.open.repository.NucleoRepository;
import com.voltaomundo.open.service.SumulaService;
import com.voltaomundo.open.web.dto.AvaliacaoJuizRequest;
import com.voltaomundo.open.web.dto.SumulaJogoRequest;
import com.voltaomundo.open.web.dto.SumulaJogoResponse;

@SpringBootTest
class SumulaServiceTests {

    @Autowired
    private SumulaService sumulaService;

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
    private JogoRepository jogoRepository;

    @Autowired
    private JuizRepository juizRepository;

    @Test
    void deveRegistrarSumulaComTresJuizesEFinalizarJogo() {
        ContextoBase contexto = criarContextoBase();

        SumulaJogoResponse resposta = sumulaService.registrar(contexto.jogo().getId(), new SumulaJogoRequest(
                "Luta equilibrada",
                List.of(
                        new AvaliacaoJuizRequest(contexto.juiz1().getId(), 10, 8, "Boa agressividade"),
                        new AvaliacaoJuizRequest(contexto.juiz2().getId(), 9, 10, "Melhor controle azul"),
                        new AvaliacaoJuizRequest(contexto.juiz3().getId(), 10, 9, "Vermelho melhor no fim"))));

        assertThat(resposta.vencedor()).isEqualTo(LadoCompetidor.VERMELHO);
        assertThat(resposta.pontosVermelho()).isEqualTo(29);
        assertThat(resposta.pontosAzul()).isEqualTo(27);
        assertThat(resposta.avaliacoes()).hasSize(3);
        assertThat(resposta.status()).isEqualTo(StatusJogo.FINALIZADO);

        Jogo jogoAtualizado = jogoRepository.findById(contexto.jogo().getId()).orElseThrow();
        assertThat(jogoAtualizado.getStatus()).isEqualTo(StatusJogo.FINALIZADO);
        assertThat(jogoAtualizado.getVencedor()).isEqualTo(LadoCompetidor.VERMELHO);
        assertThat(jogoAtualizado.getPontosVermelho()).isEqualTo(29);
        assertThat(jogoAtualizado.getPontosAzul()).isEqualTo(27);
    }

    @Test
    void deveRejeitarSumulaComJuizDuplicado() {
        ContextoBase contexto = criarContextoBase();

        assertThatThrownBy(() -> sumulaService.registrar(contexto.jogo().getId(), new SumulaJogoRequest(
                "Tentativa invalida",
                List.of(
                        new AvaliacaoJuizRequest(contexto.juiz1().getId(), 10, 8, null),
                        new AvaliacaoJuizRequest(contexto.juiz1().getId(), 9, 10, null),
                        new AvaliacaoJuizRequest(contexto.juiz3().getId(), 10, 9, null)))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("juiz diferente");
    }

    private ContextoBase criarContextoBase() {
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
        nucleo.setNome("Nucleo A");
        nucleo = nucleoRepository.save(nucleo);

        Atleta atletaVermelho = atleta("Atleta Vermelho", categoria, nucleo);
        Atleta atletaAzul = atleta("Atleta Azul", categoria, nucleo);

        Fase fase = new Fase();
        fase.setCampeonato(campeonato);
        fase.setNome("Quartas");
        fase.setTipo(TipoFase.ELIMINATORIA);
        fase.setOrdem(1);
        fase = faseRepository.save(fase);

        Jogo jogo = new Jogo();
        jogo.setFase(fase);
        jogo.setCategoria(categoria);
        jogo.setAtletaVermelho(atletaVermelho);
        jogo.setAtletaAzul(atletaAzul);
        jogo = jogoRepository.save(jogo);

        Juiz juiz1 = juiz("Juiz 1", "J1", campeonato);
        Juiz juiz2 = juiz("Juiz 2", "J2", campeonato);
        Juiz juiz3 = juiz("Juiz 3", "J3", campeonato);

        return new ContextoBase(jogo, juiz1, juiz2, juiz3);
    }

    private Atleta atleta(String nome, Categoria categoria, Nucleo nucleo) {
        Atleta atleta = new Atleta();
        atleta.setNome(nome);
        atleta.setStatus(StatusAtleta.ATIVO);
        atleta.setCategoria(categoria);
        atleta.setNucleo(nucleo);
        return atletaRepository.save(atleta);
    }

    private Juiz juiz(String nome, String registro, Campeonato campeonato) {
        Juiz juiz = new Juiz();
        juiz.setNome(nome);
        juiz.setRegistro(registro);
        juiz.setCampeonato(campeonato);
        return juizRepository.save(juiz);
    }

    private record ContextoBase(Jogo jogo, Juiz juiz1, Juiz juiz2, Juiz juiz3) {
    }
}
