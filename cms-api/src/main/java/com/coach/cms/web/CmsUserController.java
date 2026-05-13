package com.coach.cms.web;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.repository.CmsUserRepository;
import com.coach.cms.security.CurrentUser;
import com.coach.cms.web.dto.CmsUserCreateRequest;
import com.coach.cms.web.dto.CmsUserPasswordRequest;
import com.coach.cms.web.dto.CmsUserUpdateRequest;
import com.coach.cms.web.dto.CmsUserView;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * Admin-only user CRUD. The CMS only allows enabling/disabling — there is
 * no hard delete because content tables foreign-key into cms_users.
 */
@RestController
@RequestMapping("/api/cms/users")
@PreAuthorize("hasRole('ADMIN')")
public class CmsUserController {

    private final CmsUserRepository users;
    private final PasswordEncoder encoder;

    public CmsUserController(CmsUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @GetMapping
    public List<CmsUserView> list() {
        return users.findAll().stream()
                .sorted(Comparator.comparing(CmsUser::getId))
                .map(CmsUserView::from)
                .toList();
    }

    @GetMapping("/{id}")
    public CmsUserView get(@PathVariable Long id) {
        return CmsUserView.from(load(id));
    }

    @PostMapping
    public ResponseEntity<CmsUserView> create(@Valid @RequestBody CmsUserCreateRequest req) {
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email already exists");
        }
        Instant now = Instant.now();
        CmsUser u = CmsUser.builder()
                .email(req.email().trim())
                .name(req.name().trim())
                .role(req.role())
                .active(true)
                .passwordHash(encoder.encode(req.password()))
                .createdAt(now)
                .updatedAt(now)
                .build();
        users.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(CmsUserView.from(u));
    }

    @PutMapping("/{id}")
    public CmsUserView update(@PathVariable Long id, @Valid @RequestBody CmsUserUpdateRequest req) {
        CmsUser u = load(id);
        Long meId = CurrentUser.require().id();
        if (id.equals(meId) && (!Boolean.TRUE.equals(req.active()) || req.role() != u.getRole())) {
            // Prevent the only signed-in admin from locking themselves out
            // or demoting their own role mid-session.
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "cannot disable or demote the currently signed-in admin");
        }
        u.setName(req.name().trim());
        u.setRole(req.role());
        u.setActive(req.active());
        u.setUpdatedAt(Instant.now());
        users.save(u);
        return CmsUserView.from(u);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> setPassword(@PathVariable Long id,
                                            @Valid @RequestBody CmsUserPasswordRequest req) {
        CmsUser u = load(id);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setUpdatedAt(Instant.now());
        users.save(u);
        return ResponseEntity.noContent().build();
    }

    private CmsUser load(Long id) {
        return users.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
    }
}
