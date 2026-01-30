// src/app/core/models/user.model.ts

/**
 * User model used across the application
 * Matches the backend AuthResponse structure
 */
export interface User {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
}

/**
 * Login credentials
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;  // Added for login component
}

/**
 * Registration data
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name?: string;  // Added for backward compatibility
}

/**
 * Authentication response from API
 */
export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * User profile update request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}