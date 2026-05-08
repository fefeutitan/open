package com.voltaomundo.open.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CorrecaoResultadoJogoRequest(
        @NotBlank @Size(max = 1000) String motivo,
        @NotNull @Valid ResultadoJogoRequest resultado) {
}
