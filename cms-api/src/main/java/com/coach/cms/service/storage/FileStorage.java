package com.coach.cms.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorage {
    StoredFile store(MultipartFile file);
}
