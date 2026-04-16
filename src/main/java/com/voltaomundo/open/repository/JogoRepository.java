package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Jogo;

public interface JogoRepository extends JpaRepository<Jogo, Long> {
    List<Jogo> findByFaseCampeonatoId(Long campeonatoId);

    List<Jogo> findByGrupoId(Long grupoId);

    List<Jogo> findByFaseId(Long faseId);
}
