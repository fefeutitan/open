package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByCampeonatoId(Long campeonatoId);
}
