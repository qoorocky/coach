package com.coach.cms.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "coach.storage")
public record StorageProperties(
        String type,
        Local local
) {
    public StorageProperties {
        if (type == null || type.isBlank()) type = "local";
        if (local == null) local = new Local(null, null);
    }

    public record Local(String baseDir, String publicBaseUrl) {
        public Local {
            if (baseDir == null || baseDir.isBlank()) baseDir = "./uploads";
            if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
                publicBaseUrl = "http://localhost:8080/uploads";
            }
        }
    }
}
