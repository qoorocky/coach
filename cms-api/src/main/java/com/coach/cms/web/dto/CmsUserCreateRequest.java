package com.coach.cms.web.dto;

import com.coach.cms.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CmsUserCreateRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(max = 100) String name,
        @NotNull Role role,
        @NotBlank @Size(min = 8, max = 100) String password
) {}
