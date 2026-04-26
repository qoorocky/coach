package com.coach.cms.config;

import com.coach.cms.domain.CmsUser;
import com.coach.cms.domain.Role;
import com.coach.cms.repository.CmsUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@Configuration
@EnableConfigurationProperties(SeedProperties.class)
public class SeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedRunner.class);

    private final SeedProperties props;
    private final CmsUserRepository users;
    private final PasswordEncoder encoder;

    public SeedRunner(SeedProperties props, CmsUserRepository users, PasswordEncoder encoder) {
        this.props = props;
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!props.enabled()) {
            return;
        }
        if (users.count() > 0) {
            return;
        }
        Instant now = Instant.now();
        CmsUser admin = CmsUser.builder()
                .email(props.adminEmail())
                .name(props.adminName())
                .passwordHash(encoder.encode(props.adminPassword()))
                .role(Role.ADMIN)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        users.save(admin);
        log.warn("[seed] created initial admin user: {} (change password immediately)", props.adminEmail());
    }
}
