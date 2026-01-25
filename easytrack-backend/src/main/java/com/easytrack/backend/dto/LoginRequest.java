package com.easytrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Please enter your email")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Please enter your Password")
    private String password;
}