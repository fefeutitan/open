package com.voltaomundo.open.web.dto;

import jakarta.validation.constraints.NotNull;

public record GeracaoMataMataRequest(
        @NotNull Long faseEliminatoriaId) {
}
