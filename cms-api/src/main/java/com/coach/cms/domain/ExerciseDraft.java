package com.coach.cms.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exercise_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseDraft {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "name_zh", nullable = false, length = 100)
    private String nameZh;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "video_size_bytes")
    private Long videoSizeBytes;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<String> equipment = new ArrayList<>();

    @Type(JsonType.class)
    @Column(name = "primary_muscles", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<String> primaryMuscles = new ArrayList<>();

    @Type(JsonType.class)
    @Column(name = "secondary_muscles", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<String> secondaryMuscles = new ArrayList<>();

    @Column(length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentStatus status;

    @Column(name = "current_version", nullable = false)
    private int currentVersion;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
