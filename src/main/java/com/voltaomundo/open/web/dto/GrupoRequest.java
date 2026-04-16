package com.voltaomundo.open.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GrupoRequest(
        @NotNull Long faseId,
        @NotBlank String nome) {
}
