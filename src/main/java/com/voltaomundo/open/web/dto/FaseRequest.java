package com.voltaomundo.open.web.dto;

import com.voltaomundo.open.domain.TipoFase;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FaseRequest(
        @NotNull Long campeonatoId,
        @NotBlank String nome,
        @NotNull TipoFase tipo,
        @NotNull Integer ordem,
        Integer classificadosPorGrupo) {
}
