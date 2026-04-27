package com.coach.cms.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
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
@Table(name = "workouts_published")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutPublished {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "draft_id", nullable = false, columnDefinition = "uuid")
    private UUID draftId;

    @Column(nullable = false)
    private int version;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String description = "";

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "estimated_duration_sec", nullable = false)
    private int estimatedDurationSec;

    @Column(name = "estimated_calories", nullable = false)
    private int estimatedCalories;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "created_by_type", nullable = false, length = 10)
    @Builder.Default
    private String createdByType = "system";

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "published_by", nullable = false)
    private Long publishedBy;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "workout_published_id", nullable = false)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<WorkoutPublishedSegment> segments = new ArrayList<>();
}
