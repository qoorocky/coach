package com.coach.cms.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CmsUserPasswordRequest(
        @NotBlank @Size(min = 8, max = 100) String password
) {}
