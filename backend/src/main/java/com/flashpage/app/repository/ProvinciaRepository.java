package com.flashpage.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.model.Provincia;

public interface ProvinciaRepository extends JpaRepository<Provincia, Long> {
}