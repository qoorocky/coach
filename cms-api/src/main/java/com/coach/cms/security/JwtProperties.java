package com.coach.cms.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "coach.jwt")
public record JwtProperties(
        String secret,
        long accessTokenTtlSeconds,
        String issuer
) {
}
