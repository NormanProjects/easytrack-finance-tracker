package com.easytrack.backend.mapper;

import com.easytrack.backend.dto.UserCreateDTO;
import com.easytrack.backend.dto.UserDTO;
import com.easytrack.backend.dto.UserUpdateDTO;
import com.easytrack.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setOauthProvider(user.getOauthProvider());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setIsEmailVerified(user.getIsEmailVerified());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setLastLoginAt(user.getLastLoginAt());
        return dto;
    }

    public User toEntity(UserCreateDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword()); // In real app, hash this!
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setIsEmailVerified(false);
        user.setIsActive(true);
        return user;
    }

    public void updateEntityFromDTO(UserUpdateDTO dto, User user) {
        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(dto.getProfilePictureUrl());
        }
    }
}