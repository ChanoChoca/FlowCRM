package com.flashpage.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.model.Central;

public interface CentralRepository extends JpaRepository<Central, Long> {
    List<Central> findByActivoTrue();
}