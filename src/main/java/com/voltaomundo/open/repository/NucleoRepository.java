package com.voltaomundo.open.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltaomundo.open.domain.Nucleo;

public interface NucleoRepository extends JpaRepository<Nucleo, Long> {
    List<Nucleo> findByCampeonatoId(Long campeonatoId);
}
