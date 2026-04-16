package com.voltaomundo.open.service;

import org.springframework.stereotype.Service;

import com.voltaomundo.open.domain.Atleta;
import com.voltaomundo.open.domain.Campeonato;
import com.voltaomundo.open.domain.Categoria;
import com.voltaomundo.open.domain.Fase;
import com.voltaomundo.open.domain.Grupo;
import com.voltaomundo.open.domain.Jogo;
import com.voltaomundo.open.domain.Juiz;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.repository.AtletaRepository;
import com.voltaomundo.open.repository.CampeonatoRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.FaseRepository;
import com.voltaomundo.open.repository.GrupoRepository;
import com.voltaomundo.open.repository.JogoRepository;
import com.voltaomundo.open.repository.JuizRepository;
import com.voltaomundo.open.repository.NucleoRepository;

@Service
public class EntityLookupService {

    private final CampeonatoRepository campeonatoRepository;
    private final CategoriaRepository categoriaRepository;
    private final NucleoRepository nucleoRepository;
    private final AtletaRepository atletaRepository;
    private final JuizRepository juizRepository;
    private final FaseRepository faseRepository;
    private final GrupoRepository grupoRepository;
    private final JogoRepository jogoRepository;

    public EntityLookupService(CampeonatoRepository campeonatoRepository,
            CategoriaRepository categoriaRepository,
            NucleoRepository nucleoRepository,
            AtletaRepository atletaRepository,
            JuizRepository juizRepository,
            FaseRepository faseRepository,
            GrupoRepository grupoRepository,
            JogoRepository jogoRepository) {
        this.campeonatoRepository = campeonatoRepository;
        this.categoriaRepository = categoriaRepository;
        this.nucleoRepository = nucleoRepository;
        this.atletaRepository = atletaRepository;
        this.juizRepository = juizRepository;
        this.faseRepository = faseRepository;
        this.grupoRepository = grupoRepository;
        this.jogoRepository = jogoRepository;
    }

    public Campeonato campeonato(Long id) {
        return campeonatoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campeonato não encontrado: " + id));
    }

    public Categoria categoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada: " + id));
    }

    public Nucleo nucleo(Long id) {
        return nucleoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Núcleo não encontrado: " + id));
    }

    public Atleta atleta(Long id) {
        return atletaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Atleta não encontrado: " + id));
    }

    public Juiz juiz(Long id) {
        return juizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Juiz não encontrado: " + id));
    }

    public Fase fase(Long id) {
        return faseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fase não encontrada: " + id));
    }

    public Grupo grupo(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + id));
    }

    public Jogo jogo(Long id) {
        return jogoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado: " + id));
    }
}
