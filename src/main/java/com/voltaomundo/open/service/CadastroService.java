package com.voltaomundo.open.service;

import org.springframework.stereotype.Service;

import com.voltaomundo.open.domain.Atleta;
import com.voltaomundo.open.domain.Categoria;
import com.voltaomundo.open.domain.Juiz;
import com.voltaomundo.open.domain.Nucleo;
import com.voltaomundo.open.repository.AtletaRepository;
import com.voltaomundo.open.repository.CategoriaRepository;
import com.voltaomundo.open.repository.JuizRepository;
import com.voltaomundo.open.repository.NucleoRepository;
import com.voltaomundo.open.web.dto.AtletaRequest;
import com.voltaomundo.open.web.dto.CategoriaRequest;
import com.voltaomundo.open.web.dto.JuizRequest;
import com.voltaomundo.open.web.dto.NucleoRequest;

@Service
public class CadastroService {

    private final CategoriaRepository categoriaRepository;
    private final NucleoRepository nucleoRepository;
    private final AtletaRepository atletaRepository;
    private final JuizRepository juizRepository;
    private final EntityLookupService lookupService;

    public CadastroService(CategoriaRepository categoriaRepository,
            NucleoRepository nucleoRepository,
            AtletaRepository atletaRepository,
            JuizRepository juizRepository,
            EntityLookupService lookupService) {
        this.categoriaRepository = categoriaRepository;
        this.nucleoRepository = nucleoRepository;
        this.atletaRepository = atletaRepository;
        this.juizRepository = juizRepository;
        this.lookupService = lookupService;
    }

    public Categoria criarCategoria(CategoriaRequest request) {
        Categoria categoria = new Categoria();
        categoria.setCampeonato(lookupService.campeonato(request.campeonatoId()));
        categoria.setNome(request.nome());
        categoria.setGenero(request.genero());
        categoria.setIdadeMinima(request.idadeMinima());
        categoria.setIdadeMaxima(request.idadeMaxima());
        categoria.setPesoMinimo(request.pesoMinimo());
        categoria.setPesoMaximo(request.pesoMaximo());
        return categoriaRepository.save(categoria);
    }

    public Nucleo criarNucleo(NucleoRequest request) {
        Nucleo nucleo = new Nucleo();
        nucleo.setCampeonato(lookupService.campeonato(request.campeonatoId()));
        nucleo.setNome(request.nome());
        nucleo.setCidade(request.cidade());
        nucleo.setResponsavel(request.responsavel());
        return nucleoRepository.save(nucleo);
    }

    public Atleta criarAtleta(AtletaRequest request) {
        Atleta atleta = new Atleta();
        atleta.setNome(request.nome());
        atleta.setDocumento(request.documento());
        atleta.setDataNascimento(request.dataNascimento());
        atleta.setStatus(request.status());
        atleta.setCategoria(lookupService.categoria(request.categoriaId()));
        atleta.setNucleo(lookupService.nucleo(request.nucleoId()));
        return atletaRepository.save(atleta);
    }

    public Juiz criarJuiz(JuizRequest request) {
        Juiz juiz = new Juiz();
        juiz.setCampeonato(lookupService.campeonato(request.campeonatoId()));
        juiz.setNome(request.nome());
        juiz.setRegistro(request.registro());
        return juizRepository.save(juiz);
    }
}
