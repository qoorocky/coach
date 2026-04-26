package com.coach.cms.web;

import com.coach.cms.service.ContentSyncService;
import com.coach.cms.web.dto.SyncResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/content")
public class ContentSyncController {

    private final ContentSyncService service;

    public ContentSyncController(ContentSyncService service) {
        this.service = service;
    }

    @GetMapping("/sync")
    public SyncResponse sync(@RequestParam(name = "since", defaultValue = "0") long since) {
        return service.sync(since);
    }
}
