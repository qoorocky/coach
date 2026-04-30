package com.coach.cms.service.storage;

import com.coach.cms.config.StorageProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Component
public class LocalFileStorage implements FileStorage {

    private final Path baseDir;
    private final String publicBaseUrl;

    public LocalFileStorage(StorageProperties props) {
        this.baseDir = Path.of(props.local().baseDir()).toAbsolutePath().normalize();
        String url = props.local().publicBaseUrl();
        this.publicBaseUrl = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        try {
            Files.createDirectories(this.baseDir);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create upload directory: " + baseDir, e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file) {
        String ext = extension(file.getOriginalFilename());
        String datedDir = LocalDate.now().toString();
        String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        Path subDir = baseDir.resolve(datedDir);
        Path target = subDir.resolve(filename).normalize();
        if (!target.startsWith(baseDir)) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Invalid target path");
        }
        try {
            Files.createDirectories(subDir);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Failed to write file", e);
        }
        String url = publicBaseUrl + "/" + datedDir + "/" + filename;
        return new StoredFile(url, file.getSize(), file.getContentType(), file.getOriginalFilename());
    }

    public Path baseDir() {
        return baseDir;
    }

    private static String extension(String filename) {
        if (filename == null) return "";
        int i = filename.lastIndexOf('.');
        if (i < 0 || i == filename.length() - 1) return "";
        String ext = filename.substring(i + 1).toLowerCase();
        return ext.matches("[a-z0-9]{1,8}") ? ext : "";
    }
}
