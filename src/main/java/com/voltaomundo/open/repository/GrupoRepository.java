package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Grupo;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    List<Grupo> findByFaseId(Long faseId);
}
