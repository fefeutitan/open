package com.voltaomundo.open.web.dto;

public record AvaliacaoJuizDto(
        Long avaliacaoId,
        Long juizId,
        String juizNome,
        Integer pontosVermelho,
        Integer pontosAzul,
        String observacoes) {
}
