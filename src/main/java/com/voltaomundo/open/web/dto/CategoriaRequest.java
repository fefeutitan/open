package com.voltaomundo.open.web.dto;

import java.math.BigDecimal;

import com.voltaomundo.open.domain.GeneroCategoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaRequest(
        @NotNull Long campeonatoId,
        @NotBlank String nome,
        @NotNull GeneroCategoria genero,
        Integer idadeMinima,
        Integer idadeMaxima,
        BigDecimal pesoMinimo,
        BigDecimal pesoMaximo) {
}
