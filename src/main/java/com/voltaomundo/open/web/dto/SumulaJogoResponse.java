package com.voltaomundo.open.web.dto;

import java.util.List;

import com.voltaomundo.open.domain.LadoCompetidor;
import com.voltaomundo.open.domain.StatusJogo;

public record SumulaJogoResponse(
        Long sumulaId,
        Long jogoId,
        String observacoes,
        Integer pontosVermelho,
        Integer pontosAzul,
        LadoCompetidor vencedor,
        StatusJogo status,
        List<AvaliacaoJuizDto> avaliacoes) {
}
