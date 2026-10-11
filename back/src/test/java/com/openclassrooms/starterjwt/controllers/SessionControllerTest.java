package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WithMockUser
class SessionControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SessionRepository sessionRepository;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        teacher = teacherRepository.save(
                Teacher.builder()
                        .firstName("John")
                        .lastName("Doe")
                        .build()
        );
    }

    private Session createSession() {
        Session session = Session.builder()
                .name("Yoga session")
                .date(new Date())
                .description("Test description")
                .teacher(teacher)
                .users(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return sessionRepository.save(session);
    }

    private User createUser(String email) {
        return userRepository.save(
                User.builder()
                        .email(email)
                        .firstName("Jane")
                        .lastName("Doe")
                        .password("password")
                        .admin(false)
                        .build()
        );
    }

    @Test
    void shouldCreateAndFindSession() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Yoga session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("A relaxing yoga session");
        sessionDto.setTeacher_id(teacher.getId());

        String response = mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga session"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode created = objectMapper.readTree(response);
        Long sessionId = created.get("id").asLong();

        mockMvc.perform(get("/api/session/" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga session"));
    }

    @Test
    void shouldReturnNotFoundForUnknownSession() throws Exception {
        mockMvc.perform(get("/api/session/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithAnonymousUser
    void shouldReturnUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findAll_shouldReturnOk() throws Exception {
        createSession();

        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk());
    }

    @Test
    void update_shouldReturnOk() throws Exception {
        Session session = createSession();

        SessionDto dto = new SessionDto();
        dto.setName("Updated name");
        dto.setDate(new Date());
        dto.setDescription("Updated description");
        dto.setTeacher_id(session.getTeacher().getId());

        mockMvc.perform(put("/api/session/" + session.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    void update_shouldReturnBadRequest_whenIdIsNotNumeric() throws Exception {
        SessionDto dto = new SessionDto();

        mockMvc.perform(put("/api/session/abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void save_shouldReturnOk_whenSessionExists() throws Exception {
        Session session = createSession();

        mockMvc.perform(delete("/api/session/" + session.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void save_shouldReturnNotFound_whenSessionDoesNotExist() throws Exception {
        mockMvc.perform(delete("/api/session/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void save_shouldReturnBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(delete("/api/session/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void participate_shouldReturnOk() throws Exception {
        Session session = createSession();
        User user = createUser("participate@test.com");

        mockMvc.perform(post("/api/session/" + session.getId() + "/participate/" + user.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void participate_shouldReturnBadRequest_whenIdsAreNotNumeric() throws Exception {
        mockMvc.perform(post("/api/session/abc/participate/xyz"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void noLongerParticipate_shouldReturnOk() throws Exception {
        Session session = createSession();
        User user = createUser("noparticipate@test.com");

        session.getUsers().add(user);
        sessionRepository.save(session);

        mockMvc.perform(delete("/api/session/" + session.getId() + "/participate/" + user.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void noLongerParticipate_shouldReturnBadRequest_whenIdsAreNotNumeric() throws Exception {
        mockMvc.perform(delete("/api/session/abc/participate/xyz"))
                .andExpect(status().isBadRequest());
    }
}