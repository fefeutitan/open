package com.voltaomundo.open.web.dto;

import java.time.OffsetDateTime;

import com.voltaomundo.open.domain.CorrecaoJogo;
import com.voltaomundo.open.domain.TipoCorrecaoJogo;

public record CorrecaoJogoResponse(
        Long id,
        Long jogoId,
        TipoCorrecaoJogo tipo,
        String motivo,
        String detalheAnterior,
        String detalheNovo,
        OffsetDateTime criadoEm) {

    public static CorrecaoJogoResponse from(CorrecaoJogo correcao) {
        return new CorrecaoJogoResponse(
                correcao.getId(),
                correcao.getJogo().getId(),
                correcao.getTipo(),
                correcao.getMotivo(),
                correcao.getDetalheAnterior(),
                correcao.getDetalheNovo(),
                correcao.getCriadoEm());
    }
}
