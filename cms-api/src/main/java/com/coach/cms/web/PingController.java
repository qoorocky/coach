package com.coach.cms.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class PingController {

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of(
            "service", "cms-api",
            "status", "ok",
            "serverTime", Instant.now().toEpochMilli()
        );
    }
}
