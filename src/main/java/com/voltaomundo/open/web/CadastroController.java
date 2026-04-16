package com.voltaomundo.open.web;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.voltaomundo.open.domain.Atleta;
import com.voltaomundo.open.domain.Categoria;
import com.voltaomundo.open.domain.Juiz;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.repository.AtletaRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.JuizRepository;
import com.voltaomundo.open.repository.NucleoRepository;
import com.voltaomundo.open.service.CadastroService;
import com.voltaomundo.open.web.dto.AtletaRequest;
import com.voltaomundo.open.web.dto.CategoriaRequest;
import com.voltaomundo.open.web.dto.JuizRequest;
import com.voltaomundo.open.web.dto.NucleoRequest;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/cadastros")
public class CadastroController {

    private final CategoriaRepository categoriaRepository;
    private final NucleoRepository nucleoRepository;
    private final AtletaRepository atletaRepository;
    private final JuizRepository juizRepository;
    private final CadastroService cadastroService;

    public CadastroController(CategoriaRepository categoriaRepository,
            NucleoRepository nucleoRepository,
            AtletaRepository atletaRepository,
            JuizRepository juizRepository,
            CadastroService cadastroService) {
        this.categoriaRepository = categoriaRepository;
        this.nucleoRepository = nucleoRepository;
        this.atletaRepository = atletaRepository;
        this.juizRepository = juizRepository;
        this.cadastroService = cadastroService;
    }

    @GetMapping("/categorias")
    public List<Categoria> listarCategorias(@RequestParam(required = false) Long campeonatoId) {
        return campeonatoId == null ? categoriaRepository.findAll() : categoriaRepository.findByCampeonatoId(campeonatoId);
    }

    @PostMapping("/categorias")
    public Categoria criarCategoria(@Valid @RequestBody CategoriaRequest request) {
        return cadastroService.criarCategoria(request);
    }

    @GetMapping("/nucleos")
    public List<Nucleo> listarNucleos(@RequestParam(required = false) Long campeonatoId) {
        return campeonatoId == null ? nucleoRepository.findAll() : nucleoRepository.findByCampeonatoId(campeonatoId);
    }

    @PostMapping("/nucleos")
    public Nucleo criarNucleo(@Valid @RequestBody NucleoRequest request) {
        return cadastroService.criarNucleo(request);
    }

    @GetMapping("/atletas")
    public List<Atleta> listarAtletas(@RequestParam(required = false) Long campeonatoId) {
        return campeonatoId == null ? atletaRepository.findAll() : atletaRepository.findByCategoriaCampeonatoId(campeonatoId);
    }

    @PostMapping("/atletas")
    public Atleta criarAtleta(@Valid @RequestBody AtletaRequest request) {
        return cadastroService.criarAtleta(request);
    }

    @GetMapping("/juizes")
    public List<Juiz> listarJuizes(@RequestParam(required = false) Long campeonatoId) {
        return campeonatoId == null ? juizRepository.findAll() : juizRepository.findByCampeonatoId(campeonatoId);
    }

    @PostMapping("/juizes")
    public Juiz criarJuiz(@Valid @RequestBody JuizRequest request) {
        return cadastroService.criarJuiz(request);
    }
}
