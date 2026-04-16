package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Atleta;

public interface AtletaRepository extends JpaRepository<Atleta, Long> {
    List<Atleta> findByCategoriaCampeonatoId(Long campeonatoId);
}
