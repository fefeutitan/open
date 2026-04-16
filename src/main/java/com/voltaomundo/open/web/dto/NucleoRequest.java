package com.voltaomundo.open.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NucleoRequest(
        @NotNull Long campeonatoId,
        @NotBlank String nome,
        String cidade,
        String responsavel) {
}
