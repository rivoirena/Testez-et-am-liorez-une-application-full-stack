package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        teacher = new Teacher();
        teacher.setId(1L);
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
    }

    @Test
    void findAll_shouldReturnListOfTeachers() {
        Teacher teacher2 = new Teacher();
        teacher2.setId(2L);
        teacher2.setFirstName("Jane");
        teacher2.setLastName("Smith");

        when(teacherRepository.findAll()).thenReturn(Arrays.asList(teacher, teacher2));

        List<Teacher> result = teacherService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(teacher, teacher2);
        verify(teacherRepository).findAll();
    }

    @Test
    void findAll_whenNoTeachers_shouldReturnEmptyList() {
        when(teacherRepository.findAll()).thenReturn(Arrays.asList());

        List<Teacher> result = teacherService.findAll();

        assertThat(result).isEmpty();
    }

    @Test
    void findById_whenTeacherExists_shouldReturnTeacher() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Teacher result = teacherService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getFirstName()).isEqualTo("John");
        verify(teacherRepository).findById(1L);
    }

    @Test
    void findById_whenTeacherDoesNotExist_shouldReturnNull() {
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.empty());

        Teacher result = teacherService.findById(99L);

        assertThat(result).isNull();
    }
}