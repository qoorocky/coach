package com.coach.cms.web.dto;

import com.coach.cms.domain.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CmsUserUpdateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull Role role,
        @NotNull Boolean active
) {}
