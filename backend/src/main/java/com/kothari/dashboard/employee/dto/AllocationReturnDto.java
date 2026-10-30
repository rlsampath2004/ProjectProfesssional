package com.kothari.dashboard.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationReturnDto {

    private LocalDate returnDate;

    @NotBlank(message = "Return condition is required (e.g. Good, Fair, Damaged)")
    @Size(max = 50, message = "Condition cannot exceed 50 characters")
    private String returnCondition;

    @Size(max = 500, message = "Return notes cannot exceed 500 characters")
    private String returnNotes;
}

