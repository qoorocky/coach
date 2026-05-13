package com.coach.cms.web.dto;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.domain.Role;

import java.time.Instant;

public record CmsUserView(
        Long id,
        String email,
        String name,
        Role role,
        boolean active,
        Instant lastLoginAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static CmsUserView from(CmsUser u) {
        return new CmsUserView(
                u.getId(),
                u.getEmail(),
                u.getName(),
                u.getRole(),
                u.isActive(),
                u.getLastLoginAt(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}
