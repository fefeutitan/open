package com.voltaomundo.open.domain;

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
public class Fase extends BaseEntity {

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoFase tipo;

    @Column(nullable = false)
    private Integer ordem;

    private Integer classificadosPorGrupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Campeonato campeonato;

    @JsonIgnore
    @OneToMany(mappedBy = "fase")
    private List<Grupo> grupos = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "fase")
    private List<Jogo> jogos = new ArrayList<>();

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoFase getTipo() {
        return tipo;
    }

    public void setTipo(TipoFase tipo) {
        this.tipo = tipo;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public Integer getClassificadosPorGrupo() {
        return classificadosPorGrupo;
    }

    public void setClassificadosPorGrupo(Integer classificadosPorGrupo) {
        this.classificadosPorGrupo = classificadosPorGrupo;
    }

    public Campeonato getCampeonato() {
        return campeonato;
    }

    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }
}
