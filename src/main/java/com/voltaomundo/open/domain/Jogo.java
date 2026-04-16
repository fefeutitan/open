package com.voltaomundo.open.domain;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
public class Jogo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Fase fase;

    @ManyToOne(fetch = FetchType.LAZY)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Atleta atletaVermelho;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Atleta atletaAzul;

    private OffsetDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusJogo status = StatusJogo.AGENDADO;

    @Enumerated(EnumType.STRING)
    private LadoCompetidor vencedor;

    private Integer pontosVermelho;

    private Integer pontosAzul;

    @OneToOne(mappedBy = "jogo")
    private Sumula sumula;

    public Fase getFase() {
        return fase;
    }

    public void setFase(Fase fase) {
        this.fase = fase;
    }

    public Grupo getGrupo() {
        return grupo;
    }

    public void setGrupo(Grupo grupo) {
        this.grupo = grupo;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Atleta getAtletaVermelho() {
        return atletaVermelho;
    }

    public void setAtletaVermelho(Atleta atletaVermelho) {
        this.atletaVermelho = atletaVermelho;
    }

    public Atleta getAtletaAzul() {
        return atletaAzul;
    }

    public void setAtletaAzul(Atleta atletaAzul) {
        this.atletaAzul = atletaAzul;
    }

    public OffsetDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(OffsetDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public StatusJogo getStatus() {
        return status;
    }

    public void setStatus(StatusJogo status) {
        this.status = status;
    }

    public LadoCompetidor getVencedor() {
        return vencedor;
    }

    public void setVencedor(LadoCompetidor vencedor) {
        this.vencedor = vencedor;
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
}
