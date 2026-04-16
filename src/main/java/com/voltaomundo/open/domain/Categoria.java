package com.voltaomundo.open.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Categoria extends BaseEntity {

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GeneroCategoria genero;

    private Integer idadeMinima;

    private Integer idadeMaxima;

    private BigDecimal pesoMinimo;

    private BigDecimal pesoMaximo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Campeonato campeonato;

    @JsonIgnore
    @OneToMany(mappedBy = "categoria")
    private List<Atleta> atletas = new ArrayList<>();

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public GeneroCategoria getGenero() {
        return genero;
    }

    public void setGenero(GeneroCategoria genero) {
        this.genero = genero;
    }

    public Integer getIdadeMinima() {
        return idadeMinima;
    }

    public void setIdadeMinima(Integer idadeMinima) {
        this.idadeMinima = idadeMinima;
    }

    public Integer getIdadeMaxima() {
        return idadeMaxima;
    }

    public void setIdadeMaxima(Integer idadeMaxima) {
        this.idadeMaxima = idadeMaxima;
    }

    public BigDecimal getPesoMinimo() {
        return pesoMinimo;
    }

    public void setPesoMinimo(BigDecimal pesoMinimo) {
        this.pesoMinimo = pesoMinimo;
    }

    public BigDecimal getPesoMaximo() {
        return pesoMaximo;
    }

    public void setPesoMaximo(BigDecimal pesoMaximo) {
        this.pesoMaximo = pesoMaximo;
    }

    public Campeonato getCampeonato() {
        return campeonato;
    }

    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }
}
