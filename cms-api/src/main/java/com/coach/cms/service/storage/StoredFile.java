package com.coach.cms.service.storage;

public record StoredFile(
        String url,
        long sizeBytes,
        String mimeType,
        String originalFilename
) {
}
