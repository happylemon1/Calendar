package com.example.backend; // ← make sure this matches the package of your BackendApplication

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GoogleOAuthController {

    @GetMapping("/oauth2callback")
    public String handleGoogleCallback(@RequestParam("code") String code) {
        System.out.println("Authorization code: " + code);
        return "Received Google authorization code!";
    }
}