package com.voltaomundo.open.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Sumula;

public interface SumulaRepository extends JpaRepository<Sumula, Long> {
    Optional<Sumula> findByJogoId(Long jogoId);
}
