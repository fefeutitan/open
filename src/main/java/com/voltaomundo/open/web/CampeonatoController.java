package com.voltaomundo.open.web;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voltaomundo.open.domain.Campeonato;
import com.voltaomundo.open.domain.StatusCampeonato;
import com.voltaomundo.open.repository.CampeonatoRepository;
import com.voltaomundo.open.service.EntityLookupService;
import com.voltaomundo.open.web.dto.CampeonatoRequest;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/campeonatos")
public class CampeonatoController {

    private final CampeonatoRepository campeonatoRepository;
    private final EntityLookupService lookupService;

    public CampeonatoController(CampeonatoRepository campeonatoRepository, EntityLookupService lookupService) {
        this.campeonatoRepository = campeonatoRepository;
        this.lookupService = lookupService;
    }

    @GetMapping
    public List<Campeonato> listar() {
        return campeonatoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Campeonato buscar(@PathVariable Long id) {
        return lookupService.campeonato(id);
    }

    @PostMapping
    public Campeonato criar(@Valid @RequestBody CampeonatoRequest request) {
        Campeonato campeonato = new Campeonato();
        campeonato.setNome(request.nome());
        campeonato.setDescricao(request.descricao());
        campeonato.setLocal(request.local());
        campeonato.setDataInicio(request.dataInicio());
        campeonato.setDataFim(request.dataFim());
        campeonato.setStatus(StatusCampeonato.RASCUNHO);
        return campeonatoRepository.save(campeonato);
    }
}
