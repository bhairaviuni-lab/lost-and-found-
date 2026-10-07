package com.campus.lostfound.controller;

import com.campus.lostfound.dto.AuthDTOs;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTOs.RegisterRequest req) {
        if (req.fullName == null || req.collegeEmail == null || req.studentId == null ||
            req.phone == null || req.password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please fill all required fields."));
        }

        if (!req.password.equals(req.confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password confirmation does not match."));
        }

        if (userRepository.existsByCollegeEmail(req.collegeEmail.toLowerCase().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "College email already registered."));
        }

        if (userRepository.existsByStudentId(req.studentId.trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Student ID already registered."));
        }

        String hashedPassword = passwordEncoder.encode(req.password);
        User.Role role = req.collegeEmail.toLowerCase().contains("admin") ? User.Role.ADMIN : User.Role.STUDENT;

        User user = new User(
            req.fullName.trim(),
            req.collegeEmail.toLowerCase().trim(),
            req.studentId.trim(),
            req.phone.trim(),
            hashedPassword,
            role
        );

        User saved = userRepository.save(user);

        AuthDTOs.UserResponse userResponse = new AuthDTOs.UserResponse(
            saved.getId(), saved.getFullName(), saved.getCollegeEmail(), saved.getStudentId(), saved.getPhone(), saved.getRole().name()
        );

        String dummyJwtToken = "jwt_token_" + saved.getId() + "_" + System.currentTimeMillis();
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthDTOs.AuthResponse(
            dummyJwtToken, "Account created successfully. Please login.", userResponse
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTOs.LoginRequest req) {
        if (req.collegeEmail == null || req.password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please provide email and password."));
        }

        Optional<User> userOpt = userRepository.findByCollegeEmail(req.collegeEmail.toLowerCase().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found with this college email."));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid password. Please check your credentials."));
        }

        AuthDTOs.UserResponse userResponse = new AuthDTOs.UserResponse(
            user.getId(), user.getFullName(), user.getCollegeEmail(), user.getStudentId(), user.getPhone(), user.getRole().name()
        );

        String dummyJwtToken = "jwt_token_" + user.getId() + "_" + System.currentTimeMillis();
        return ResponseEntity.ok(new AuthDTOs.AuthResponse(
            dummyJwtToken, "Login successful.", userResponse
        ));
    }
}
