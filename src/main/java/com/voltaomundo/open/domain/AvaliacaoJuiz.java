package com.voltaomundo.open.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;

@Entity
public class AvaliacaoJuiz extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Sumula sumula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Juiz juiz;

    @Column(nullable = false)
    private Integer pontosVermelho;

    @Column(nullable = false)
    private Integer pontosAzul;

    private String observacoes;

    public Sumula getSumula() {
        return sumula;
    }

    public void setSumula(Sumula sumula) {
        this.sumula = sumula;
    }

    public Juiz getJuiz() {
        return juiz;
    }

    public void setJuiz(Juiz juiz) {
        this.juiz = juiz;
    }

    public Integer getPontosVermelho() {
        return pontosVermelho;
    }

    public void setPontosVermelho(Integer pontosVermelho) {
        this.pontosVermelho = pontosVermelho;
    }

    public Integer getPontosAzul() {
        return pontosAzul;
    }

    public void setPontosAzul(Integer pontosAzul) {
        this.pontosAzul = pontosAzul;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
