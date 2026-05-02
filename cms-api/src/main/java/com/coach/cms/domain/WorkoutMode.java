package com.coach.cms.domain;

import com.fasterxml.jackson.annotation.JsonValue;

public enum WorkoutMode {
    STANDARD("standard"),
    TABATA("tabata"),
    EMOM("emom"),
    AMRAP("amrap");

    private final String value;

    WorkoutMode(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static WorkoutMode fromValue(String value) {
        if (value == null) throw new IllegalArgumentException("mode is null");
        for (WorkoutMode m : values()) {
            if (m.value.equalsIgnoreCase(value)) return m;
        }
        throw new IllegalArgumentException("unknown mode: " + value);
    }
}
