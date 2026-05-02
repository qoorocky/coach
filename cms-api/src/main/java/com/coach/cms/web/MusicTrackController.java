package com.coach.cms.web;

import com.coach.cms.security.CurrentUser;
import com.coach.cms.service.MusicTrackService;
import com.coach.cms.web.dto.MusicTrackUpsertRequest;
import com.coach.cms.web.dto.MusicTrackView;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cms/music")
public class MusicTrackController {

    private final MusicTrackService service;

    public MusicTrackController(MusicTrackService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public Page<MusicTrackView> list(Pageable pageable) {
        return service.list(pageable).map(MusicTrackView::from);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public MusicTrackView get(@PathVariable UUID id) {
        return MusicTrackView.from(service.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public ResponseEntity<MusicTrackView> create(@Valid @RequestBody MusicTrackUpsertRequest req) {
        return ResponseEntity.ok(MusicTrackView.from(service.create(req, CurrentUser.require())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR','REVIEWER','ADMIN')")
    public MusicTrackView update(@PathVariable UUID id,
                                 @Valid @RequestBody MusicTrackUpsertRequest req) {
        return MusicTrackView.from(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('REVIEWER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
