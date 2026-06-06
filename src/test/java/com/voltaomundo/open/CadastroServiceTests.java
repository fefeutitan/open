package com.voltaomundo.open;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.voltaomundo.open.domain.Campeonato;
import com.voltaomundo.open.domain.Categoria;
import com.voltaomundo.open.domain.GeneroCategoria;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.domain.StatusAtleta;
import com.voltaomundo.open.domain.StatusCampeonato;
import com.voltaomundo.open.exception.BusinessRuleViolationException;
import com.voltaomundo.open.repository.CampeonatoRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.NucleoRepository;
import com.voltaomundo.open.service.CadastroService;
import com.voltaomundo.open.web.dto.AtletaRequest;

@SpringBootTest
class CadastroServiceTests {

    @Autowired
    private CadastroService cadastroService;

    @Autowired
    private CampeonatoRepository campeonatoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private NucleoRepository nucleoRepository;

    @Test
    void deveRejeitarAtletaQuandoCategoriaENucleoSaoDeCampeonatosDiferentes() {
        Campeonato campeonatoA = campeonato("Open A");
        Campeonato campeonatoB = campeonato("Open B");
        Categoria categoria = categoria(campeonatoA, "Adulto");
        Nucleo nucleo = nucleo(campeonatoB, "Nucleo B");

        assertThatThrownBy(() -> cadastroService.criarAtleta(
                new AtletaRequest("Atleta", null, null, StatusAtleta.ATIVO, categoria.getId(), nucleo.getId())))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("mesmo campeonato");
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
}
