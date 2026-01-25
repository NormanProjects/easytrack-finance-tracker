package com.easytrack.backend.controller;

import com.easytrack.backend.dto.UserDTO;
import com.easytrack.backend.dto.UserUpdateDTO;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.UserMapper;
import com.easytrack.backend.service.UserService;
import com.easytrack.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "APIs for managing user profile")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserDTO> getCurrentUserProfile() {
        User user = securityUtil.getAuthenticatedUser();
        return ResponseEntity.ok(userMapper.toDTO(user));
    }

    @PutMapping
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(@Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        User user = securityUtil.getAuthenticatedUser();

        userMapper.updateEntityFromDTO(userUpdateDTO, user);
        User updatedUser = userService.updateUser(user.getId(), user);
        return ResponseEntity.ok(userMapper.toDTO(updatedUser));
    }

    @DeleteMapping
    @Operation(summary = "Delete current user account")
    public ResponseEntity<Void> deleteCurrentUserAccount() {
        Long userId = securityUtil.getAuthenticatedUserId();
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}