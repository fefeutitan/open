package com.voltaomundo.open.web.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record CampeonatoRequest(
        @NotBlank String nome,
        String descricao,
        @NotBlank String local,
        LocalDate dataInicio,
        LocalDate dataFim) {
}
