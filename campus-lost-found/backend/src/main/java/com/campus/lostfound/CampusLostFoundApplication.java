package com.campus.lostfound;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point for Campus Lost & Found System.
 * 2nd Year Computer Engineering Project
 */
@SpringBootApplication
public class CampusLostFoundApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusLostFoundApplication.class, args);
        System.out.println("==================================================");
        System.out.println(" Campus Lost & Found Spring Boot Server Running! ");
        System.out.println(" REST API available at: http://localhost:8080/api ");
        System.out.println(" MySQL Database connected via Spring Data JPA   ");
        System.out.println("==================================================");
    }
}
