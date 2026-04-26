package com.coach.cms.repository;

import com.coach.cms.domain.ContentVersionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentVersionHistoryRepository extends JpaRepository<ContentVersionHistory, Long> {
}
