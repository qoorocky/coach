package com.coach.cms.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class WorkoutModeConverter implements AttributeConverter<WorkoutMode, String> {
    @Override
    public String convertToDatabaseColumn(WorkoutMode m) {
        return m == null ? null : m.getValue();
    }

    @Override
    public WorkoutMode convertToEntityAttribute(String s) {
        return s == null ? null : WorkoutMode.fromValue(s);
    }
}
