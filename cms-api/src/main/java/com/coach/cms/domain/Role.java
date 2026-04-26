package com.coach.cms.domain;

public enum Role {
    EDITOR,
    REVIEWER,
    ADMIN;

    public String authority() {
        return "ROLE_" + name();
    }
}
