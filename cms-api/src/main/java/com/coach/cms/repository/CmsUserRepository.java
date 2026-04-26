package com.coach.cms.repository;

import com.coach.cms.domain.CmsUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CmsUserRepository extends JpaRepository<CmsUser, Long> {
    Optional<CmsUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
