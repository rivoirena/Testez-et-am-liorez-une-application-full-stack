package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TeacherControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        teacherRepository.deleteAll();

        teacher = teacherRepository.save(
                Teacher.builder()
                        .firstName("John")
                        .lastName("Doe")
                        .build()
        );
    }

    @Test
    @WithMockUser
    void findById_shouldReturnOk_whenTeacherExists() throws Exception {
        mockMvc.perform(get("/api/teacher/" + teacher.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }

    @Test
    @WithMockUser
    void findById_shouldReturnNotFound_whenTeacherDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/teacher/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void findById_shouldReturnBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/teacher/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findById_shouldReturnUnauthorized_withoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/teacher/" + teacher.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void findAll_shouldReturnOk_withListOfTeachers() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].firstName").value("John"))
                .andExpect(jsonPath("$[0].lastName").value("Doe"));
    }

    @Test
    @WithMockUser
    void findAll_shouldReturnEmptyList_whenNoTeachersExist() throws Exception {
        teacherRepository.deleteAll();

        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void findAll_shouldReturnUnauthorized_withoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }
}