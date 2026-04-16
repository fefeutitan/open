package com.voltaomundo.open.web.dto;

import java.time.LocalDate;

import com.voltaomundo.open.domain.StatusAtleta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtletaRequest(
        @NotBlank String nome,
        String documento,
        LocalDate dataNascimento,
        @NotNull StatusAtleta status,
        @NotNull Long categoriaId,
        @NotNull Long nucleoId) {
}
