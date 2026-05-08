package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.CorrecaoJogo;

public interface CorrecaoJogoRepository extends JpaRepository<CorrecaoJogo, Long> {
    List<CorrecaoJogo> findByJogoIdOrderByCriadoEmAsc(Long jogoId);
}
