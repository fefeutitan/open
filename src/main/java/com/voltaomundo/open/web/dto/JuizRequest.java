package com.voltaomundo.open.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JuizRequest(
        @NotNull Long campeonatoId,
        @NotBlank String nome,
        String registro) {
}
