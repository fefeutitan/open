package com.voltaomundo.open.web.dto;

import com.voltaomundo.open.domain.LadoCompetidor;

import jakarta.validation.constraints.NotNull;

public record ResultadoJogoRequest(
        @NotNull Integer pontosVermelho,
        @NotNull Integer pontosAzul,
        @NotNull LadoCompetidor vencedor) {
}
