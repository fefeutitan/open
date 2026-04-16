package com.voltaomundo.open.web.dto;

public record ClassificacaoAtletaDto(
        Long atletaId,
        String atletaNome,
        int posicao,
        int jogos,
        int vitorias,
        int derrotas,
        int pontosClassificacao,
        int pontosMarcados,
        int pontosSofridos,
        int saldoPontos) {
}
