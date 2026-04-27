package com.coach.cms.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "coach.jwt")
public record JwtProperties(
        String secret,
        long accessTokenTtlSeconds,
        String issuer,
        String cookieName,
        boolean cookieSecure,
        String cookieSameSite
) {
    public JwtProperties {
        if (cookieName == null || cookieName.isBlank()) cookieName = "coach_jwt";
        if (cookieSameSite == null || cookieSameSite.isBlank()) cookieSameSite = "Lax";
    }
}
