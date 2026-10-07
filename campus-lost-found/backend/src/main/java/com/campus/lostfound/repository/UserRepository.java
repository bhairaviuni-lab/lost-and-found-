package com.campus.lostfound.repository;

import com.campus.lostfound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCollegeEmail(String collegeEmail);
    Optional<User> findByStudentId(String studentId);
    boolean existsByCollegeEmail(String collegeEmail);
    boolean existsByStudentId(String studentId);
}
