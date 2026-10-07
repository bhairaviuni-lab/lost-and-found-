package com.campus.lostfound.dto;

public class AuthDTOs {

    public static class RegisterRequest {
        public String fullName;
        public String collegeEmail;
        public String studentId;
        public String phone;
        public String password;
        public String confirmPassword;
    }

    public static class LoginRequest {
        public String collegeEmail;
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public String message;
        public UserResponse user;

        public AuthResponse(String token, String message, UserResponse user) {
            this.token = token;
            this.message = message;
            this.user = user;
        }
    }

    public static class UserResponse {
        public Long id;
        public String fullName;
        public String collegeEmail;
        public String studentId;
        public String phone;
        public String role;

        public UserResponse(Long id, String fullName, String collegeEmail, String studentId, String phone, String role) {
            this.id = id;
            this.fullName = fullName;
            this.collegeEmail = collegeEmail;
            this.studentId = studentId;
            this.phone = phone;
            this.role = role;
        }
    }

    public static class StatsResponse {
        public long totalLost;
        public long totalFound;
        public long itemsReunited;
        public long activeItems;
        public long totalUsers;

        public StatsResponse(long totalLost, long totalFound, long itemsReunited, long activeItems, long totalUsers) {
            this.totalLost = totalLost;
            this.totalFound = totalFound;
            this.itemsReunited = itemsReunited;
            this.activeItems = activeItems;
            this.totalUsers = totalUsers;
        }
    }
}
