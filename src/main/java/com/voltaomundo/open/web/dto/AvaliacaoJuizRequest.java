package com.voltaomundo.open.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvaliacaoJuizRequest(
        @NotNull Long juizId,
        @NotNull Integer pontosVermelho,
        @NotNull Integer pontosAzul,
        @Size(max = 2000) String observacoes) {
}
