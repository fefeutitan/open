package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Juiz;

public interface JuizRepository extends JpaRepository<Juiz, Long> {
    List<Juiz> findByCampeonatoId(Long campeonatoId);
}
