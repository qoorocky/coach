package com.coach.cms.web;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.repository.CmsUserRepository;
import com.coach.cms.security.CmsUserPrincipal;
import com.coach.cms.security.CurrentUser;
import com.coach.cms.security.JwtProperties;
import com.coach.cms.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
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

    public record UserInfo(Long userId, String email, String name, String role) {
        public static UserInfo of(CmsUser u) {
            return new UserInfo(u.getId(), u.getEmail(), u.getName(), u.getRole().name());
        }
        public static UserInfo of(CmsUserPrincipal p) {
            return new UserInfo(p.id(), p.email(), p.name(), p.role().name());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserInfo> login(@Valid @RequestBody LoginRequest req,
                                          HttpServletResponse response) {
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
        ResponseCookie cookie = ResponseCookie.from(jwtProperties.cookieName(), token)
                .httpOnly(true)
                .secure(jwtProperties.cookieSecure())
                .sameSite(jwtProperties.cookieSameSite())
                .path("/")
                .maxAge(jwtProperties.accessTokenTtlSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(UserInfo.of(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(jwtProperties.cookieName(), "")
                .httpOnly(true)
                .secure(jwtProperties.cookieSecure())
                .sameSite(jwtProperties.cookieSameSite())
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserInfo me() {
        return UserInfo.of(CurrentUser.require());
    }
}
