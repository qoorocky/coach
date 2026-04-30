package com.coach.cms.web;

import com.coach.cms.service.storage.FileStorage;
import com.coach.cms.service.storage.StoredFile;
import com.coach.cms.web.dto.UploadResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.PAYLOAD_TOO_LARGE;

@RestController
@RequestMapping("/api/cms/uploads")
public class UploadController {

    private static final Set<String> IMAGE_TYPES =
            Set.of("image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif");
    private static final Set<String> VIDEO_TYPES =
            Set.of("video/mp4", "video/quicktime", "video/webm");

    private static final long IMAGE_MAX_BYTES = 10L * 1024 * 1024;
    private static final long VIDEO_MAX_BYTES = 100L * 1024 * 1024;

    private final FileStorage storage;

    public UploadController(FileStorage storage) {
        this.storage = storage;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "file is required");
        }
        String mime = file.getContentType();
        if (mime == null) {
            throw new ResponseStatusException(BAD_REQUEST, "missing Content-Type");
        }
        long max;
        if (IMAGE_TYPES.contains(mime)) {
            max = IMAGE_MAX_BYTES;
        } else if (VIDEO_TYPES.contains(mime)) {
            max = VIDEO_MAX_BYTES;
        } else {
            throw new ResponseStatusException(BAD_REQUEST, "unsupported mime type: " + mime);
        }
        if (file.getSize() > max) {
            throw new ResponseStatusException(PAYLOAD_TOO_LARGE,
                    "file too large (max " + (max / (1024 * 1024)) + " MB)");
        }
        StoredFile stored = storage.store(file);
        return UploadResponse.from(stored);
    }
}
