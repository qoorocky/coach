package com.coach.cms.web;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.repository.CmsUserRepository;
import com.coach.cms.security.JwtProperties;
import com.coach.cms.security.JwtTokenProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CmsUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;

    public AuthController(CmsUserRepository users,
                          PasswordEncoder encoder,
                          JwtTokenProvider tokenProvider,
                          JwtProperties jwtProperties) {
        this.users = users;
        this.encoder = encoder;
        this.tokenProvider = tokenProvider;
        this.jwtProperties = jwtProperties;
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record LoginResponse(String accessToken, String tokenType, long expiresIn,
                                Long userId, String email, String name, String role) {}

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        CmsUser user = users.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "invalid credentials"));
        if (!user.isActive()) {
            throw new ResponseStatusException(UNAUTHORIZED, "account disabled");
        }
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "invalid credentials");
        }
        user.setLastLoginAt(Instant.now());
        users.save(user);

        String token = tokenProvider.issue(user);
        return ResponseEntity.ok(new LoginResponse(
                token, "Bearer", jwtProperties.accessTokenTtlSeconds(),
                user.getId(), user.getEmail(), user.getName(), user.getRole().name()));
    }
}
