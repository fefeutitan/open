package com.voltaomundo.open.web.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SumulaJogoRequest(
        @Size(max = 2000) String observacoes,
        @NotNull @Size(min = 3, max = 3) List<@Valid AvaliacaoJuizRequest> avaliacoes) {
}
