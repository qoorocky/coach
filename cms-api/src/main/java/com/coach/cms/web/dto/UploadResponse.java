package com.coach.cms.web.dto;

import com.coach.cms.service.storage.StoredFile;

public record UploadResponse(
        String url,
        long sizeBytes,
        String mimeType,
        String originalFilename
) {
    public static UploadResponse from(StoredFile s) {
        return new UploadResponse(s.url(), s.sizeBytes(), s.mimeType(), s.originalFilename());
    }
}
