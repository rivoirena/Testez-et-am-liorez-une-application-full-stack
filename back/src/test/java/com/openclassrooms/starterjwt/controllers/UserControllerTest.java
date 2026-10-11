package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        user = userRepository.save(
                User.builder()
                        .email("test@test.com")
                        .firstName("Jane")
                        .lastName("Smith")
                        .password(passwordEncoder.encode("password123"))
                        .admin(false)
                        .build()
        );
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void findById_shouldReturnOk_whenUserExists() throws Exception {
        mockMvc.perform(get("/api/user/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@test.com"));
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void findById_shouldReturnNotFound_whenUserDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/user/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void findById_shouldReturnBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/user/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findById_shouldReturnUnauthorized_withoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/user/" + user.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void delete_shouldReturnOk_whenUserExistsAndMatchesAuthenticatedUser() throws Exception {
        mockMvc.perform(delete("/api/user/" + user.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "other@test.com")
    void delete_shouldReturnUnauthorized_whenUserDoesNotMatchAuthenticatedUser() throws Exception {
        mockMvc.perform(delete("/api/user/" + user.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void delete_shouldReturnNotFound_whenUserDoesNotExist() throws Exception {
        mockMvc.perform(delete("/api/user/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void delete_shouldReturnBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(delete("/api/user/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_shouldReturnUnauthorized_withoutAuthentication() throws Exception {
        mockMvc.perform(delete("/api/user/" + user.getId()))
                .andExpect(status().isUnauthorized());
    }
}