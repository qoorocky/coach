package com.coach.cms.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "coach.seed")
public record SeedProperties(
        boolean enabled,
        String adminEmail,
        String adminPassword,
        String adminName
) {
}
