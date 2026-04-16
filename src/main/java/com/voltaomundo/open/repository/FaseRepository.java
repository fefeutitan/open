package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Fase;

public interface FaseRepository extends JpaRepository<Fase, Long> {
    List<Fase> findByCampeonatoIdOrderByOrdemAsc(Long campeonatoId);
}
