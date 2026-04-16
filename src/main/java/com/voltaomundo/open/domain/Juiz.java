package com.voltaomundo.open.domain;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Juiz extends BaseEntity {

    @Column(nullable = false)
    private String nome;

    private String registro;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Campeonato campeonato;

    @JsonIgnore
    @OneToMany(mappedBy = "juiz")
    private List<AvaliacaoJuiz> avaliacoes = new ArrayList<>();

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRegistro() {
        return registro;
    }

    public void setRegistro(String registro) {
        this.registro = registro;
    }

    public Campeonato getCampeonato() {
        return campeonato;
    }

    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }
}
