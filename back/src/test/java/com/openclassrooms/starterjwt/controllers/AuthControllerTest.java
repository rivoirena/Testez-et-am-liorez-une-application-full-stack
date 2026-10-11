package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void registerUser_shouldReturnOk_whenValidSignupRequest() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@test.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));
    }

    @Test
    void registerUser_shouldReturnBadRequest_whenEmailAlreadyExists() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("existing@test.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");

        // Premier enregistrement
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Deuxième enregistrement avec le même email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_shouldReturnBadRequest_whenMissingEmail() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_shouldReturnBadRequest_whenMissingPassword() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@test.com");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_shouldReturnBadRequest_whenMissingFirstName() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@test.com");
        signupRequest.setPassword("password123");
        signupRequest.setLastName("Doe");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerUser_shouldReturnBadRequest_whenMissingLastName() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@test.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("John");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void authenticateUser_shouldReturnOk_withValidCredentials() throws Exception {
        // D'abord créer un utilisateur
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("user@test.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Ensuite authentifier l'utilisateur
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("user@test.com"))  // Changé de $.email à $.username
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void authenticateUser_shouldReturnUnauthorized_withInvalidPassword() throws Exception {
        // D'abord créer un utilisateur
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("user@test.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Tenter de s'authentifier avec un mauvais mot de passe
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@test.com");
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticateUser_shouldReturnUnauthorized_withNonexistentUser() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticateUser_shouldReturnBadRequest_whenMissingEmail() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void authenticateUser_shouldReturnBadRequest_whenMissingPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@test.com");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }
}