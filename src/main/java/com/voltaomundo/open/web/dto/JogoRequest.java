package com.voltaomundo.open.web.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;

public record JogoRequest(
        @NotNull Long faseId,
        Long grupoId,
        @NotNull Long categoriaId,
        @NotNull Long atletaVermelhoId,
        @NotNull Long atletaAzulId,
        OffsetDateTime dataHora) {
}
