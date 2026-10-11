package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TeacherMapperTest {

    private TeacherMapper teacherMapper;

    private Teacher teacher;
    private TeacherDto teacherDto;

    @BeforeEach
    void setUp() {
        teacherMapper = new TeacherMapperImpl();

        teacher = Teacher.builder()
                .id(1L)
                .firstName("Marie")
                .lastName("Dupont")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teacherDto = new TeacherDto();
        teacherDto.setId(1L);
        teacherDto.setFirstName("Marie");
        teacherDto.setLastName("Dupont");
        teacherDto.setCreatedAt(LocalDateTime.now());
        teacherDto.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("toDto (entité unique)")
    class ToDto {

        @Test
        @DisplayName("devrait convertir un Teacher en TeacherDto")
        void shouldMapTeacherToDto() {
            TeacherDto result = teacherMapper.toDto(teacher);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(teacher.getId());
            assertThat(result.getFirstName()).isEqualTo(teacher.getFirstName());
            assertThat(result.getLastName()).isEqualTo(teacher.getLastName());
        }

        @Test
        @DisplayName("devrait retourner null si l'entité Teacher est null")
        void shouldReturnNullWhenTeacherIsNull() {
            TeacherDto result = teacherMapper.toDto((Teacher) null);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("toEntity (dto unique)")
    class ToEntity {

        @Test
        @DisplayName("devrait convertir un TeacherDto en Teacher")
        void shouldMapDtoToTeacher() {
            Teacher result = teacherMapper.toEntity(teacherDto);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(teacherDto.getId());
            assertThat(result.getFirstName()).isEqualTo(teacherDto.getFirstName());
            assertThat(result.getLastName()).isEqualTo(teacherDto.getLastName());
        }

        @Test
        @DisplayName("devrait retourner null si le TeacherDto est null")
        void shouldReturnNullWhenDtoIsNull() {
            Teacher result = teacherMapper.toEntity((TeacherDto) null);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("toDto (liste)")
    class ToDtoList {

        @Test
        @DisplayName("devrait convertir une liste de Teacher en liste de TeacherDto")
        void shouldMapTeacherListToDtoList() {
            List<Teacher> teachers = Arrays.asList(teacher, teacher);

            List<TeacherDto> result = teacherMapper.toDto(teachers);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getFirstName()).isEqualTo("Marie");
        }

        @Test
        @DisplayName("devrait retourner null si la liste de Teacher est null")
        void shouldReturnNullWhenTeacherListIsNull() {
            List<TeacherDto> result = teacherMapper.toDto((List<Teacher>) null);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("devrait retourner une liste vide si la liste de Teacher est vide")
        void shouldReturnEmptyListWhenTeacherListIsEmpty() {
            List<TeacherDto> result = teacherMapper.toDto(Collections.emptyList());

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("toEntity (liste)")
    class ToEntityList {

        @Test
        @DisplayName("devrait convertir une liste de TeacherDto en liste de Teacher")
        void shouldMapDtoListToTeacherList() {
            List<TeacherDto> dtos = Arrays.asList(teacherDto, teacherDto);

            List<Teacher> result = teacherMapper.toEntity(dtos);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getFirstName()).isEqualTo("Marie");
        }

        @Test
        @DisplayName("devrait retourner null si la liste de TeacherDto est null")
        void shouldReturnNullWhenDtoListIsNull() {
            List<Teacher> result = teacherMapper.toEntity((List<TeacherDto>) null);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("devrait retourner une liste vide si la liste de TeacherDto est vide")
        void shouldReturnEmptyListWhenDtoListIsEmpty() {
            List<Teacher> result = teacherMapper.toEntity(Collections.emptyList());

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }
}