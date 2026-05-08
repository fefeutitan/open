package com.voltaomundo.open.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;

@Entity
public class CorrecaoJogo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Jogo jogo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCorrecaoJogo tipo;

    @Column(nullable = false, length = 1000)
    private String motivo;

    @Column(nullable = false, length = 4000)
    private String detalheAnterior;

    @Column(nullable = false, length = 4000)
    private String detalheNovo;

    public Jogo getJogo() {
        return jogo;
    }

    public void setJogo(Jogo jogo) {
        this.jogo = jogo;
    }

    public TipoCorrecaoJogo getTipo() {
        return tipo;
    }

    public void setTipo(TipoCorrecaoJogo tipo) {
        this.tipo = tipo;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getDetalheAnterior() {
        return detalheAnterior;
    }

    public void setDetalheAnterior(String detalheAnterior) {
        this.detalheAnterior = detalheAnterior;
    }

    public String getDetalheNovo() {
        return detalheNovo;
    }

    public void setDetalheNovo(String detalheNovo) {
        this.detalheNovo = detalheNovo;
    }
}
