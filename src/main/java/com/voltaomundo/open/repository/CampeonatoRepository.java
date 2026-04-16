package com.voltaomundo.open.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Campeonato;

public interface CampeonatoRepository extends JpaRepository<Campeonato, Long> {
}
