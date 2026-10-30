package com.kothari.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Kothari Distributors - IT Asset Management & Operations Command Center
 * Spring Boot 3.3.x Application Entry Point (Java 21)
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableScheduling
public class KothariDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(KothariDashboardApplication.class, args);
    }
}

