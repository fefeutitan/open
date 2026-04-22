package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.AvaliacaoJuiz;

public interface AvaliacaoJuizRepository extends JpaRepository<AvaliacaoJuiz, Long> {
    List<AvaliacaoJuiz> findBySumulaId(Long sumulaId);

    void deleteBySumulaId(Long sumulaId);
}
