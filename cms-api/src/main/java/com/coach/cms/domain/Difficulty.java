package com.coach.cms.domain;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Difficulty {
    BEGINNER("beginner"),
    INTERMEDIATE("intermediate"),
    ADVANCED("advanced");

    private final String value;

    Difficulty(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static Difficulty fromValue(String value) {
        if (value == null) throw new IllegalArgumentException("difficulty is null");
        for (Difficulty d : values()) {
            if (d.value.equalsIgnoreCase(value)) return d;
        }
        throw new IllegalArgumentException("unknown difficulty: " + value);
    }
}
