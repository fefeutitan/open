package com.voltaomundo.open.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;

@Entity
public class Campeonato extends BaseEntity {

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Column(nullable = false)
    private String local;

    private LocalDate dataInicio;

    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCampeonato status = StatusCampeonato.RASCUNHO;

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL)
    private List<Categoria> categorias = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL)
    private List<Nucleo> nucleos = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL)
    private List<Fase> fases = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "campeonato", cascade = CascadeType.ALL)
    private List<Juiz> juizes = new ArrayList<>();

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public StatusCampeonato getStatus() {
        return status;
    }

    public void setStatus(StatusCampeonato status) {
        this.status = status;
    }
}
