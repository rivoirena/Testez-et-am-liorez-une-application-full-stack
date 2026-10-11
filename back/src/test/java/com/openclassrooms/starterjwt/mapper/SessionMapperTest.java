package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionMapperTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    @InjectMocks
    private SessionMapperImpl sessionMapper;

    private Session session;
    private SessionDto sessionDto;
    private Teacher teacher;
    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();

        user1 = User.builder()
                .id(10L)
                .email("user1@studio.com")
                .firstName("Alice")
                .lastName("Martin")
                .password("password123")
                .admin(false)
                .build();

        user2 = User.builder()
                .id(20L)
                .email("user2@studio.com")
                .firstName("Bob")
                .lastName("Durand")
                .password("password456")
                .admin(false)
                .build();

        session = Session.builder()
                .id(1L)
                .name("Yoga session")
                .date(new Date())
                .description("Une super session de yoga")
                .teacher(teacher)
                .users(Arrays.asList(user1, user2))
                .build();

        sessionDto = new SessionDto();
        sessionDto.setId(1L);
        sessionDto.setName("Yoga session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("Une super session de yoga");
        sessionDto.setTeacher_id(1L);
        sessionDto.setUsers(Arrays.asList(10L, 20L));
    }

    @Nested
    @DisplayName("toEntity")
    class ToEntity {

        @Test
        @DisplayName("devrait convertir un SessionDto en Session avec teacher et users résolus")
        void shouldMapSessionDtoToSession() {
            when(teacherService.findById(1L)).thenReturn(teacher);
            when(userService.findById(10L)).thenReturn(Optional.of(user1));
            when(userService.findById(20L)).thenReturn(Optional.of(user2));

            Session result = sessionMapper.toEntity(sessionDto);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(sessionDto.getId());
            assertThat(result.getName()).isEqualTo(sessionDto.getName());
            assertThat(result.getDescription()).isEqualTo(sessionDto.getDescription());
            assertThat(result.getTeacher()).isEqualTo(teacher);
            assertThat(result.getUsers()).hasSize(2);
            assertThat(result.getUsers()).containsExactly(user1, user2);
        }

        @Test
        @DisplayName("devrait gérer un teacher_id null")
        void shouldHandleNullTeacherId() {
            sessionDto.setTeacher_id(null);

            Session result = sessionMapper.toEntity(sessionDto);

            assertThat(result.getTeacher()).isNull();
        }

        @Test
        @DisplayName("devrait gérer une liste d'users null")
        void shouldHandleNullUsersList() {
            when(teacherService.findById(1L)).thenReturn(teacher);
            sessionDto.setUsers(null);

            Session result = sessionMapper.toEntity(sessionDto);

            assertThat(result.getUsers()).isNotNull();
            assertThat(result.getUsers()).isEmpty();
        }

        @Test
        @DisplayName("devrait gérer une liste d'users vide")
        void shouldHandleEmptyUsersList() {
            when(teacherService.findById(1L)).thenReturn(teacher);
            sessionDto.setUsers(Collections.emptyList());

            Session result = sessionMapper.toEntity(sessionDto);

            assertThat(result.getUsers()).isNotNull();
            assertThat(result.getUsers()).isEmpty();
        }

        @Test
        @DisplayName("devrait ignorer les ids d'users non trouvés (Optional vide)")
        void shouldIgnoreUnknownUserIds() {
            when(teacherService.findById(1L)).thenReturn(teacher);
            when(userService.findById(10L)).thenReturn(Optional.of(user1));
            when(userService.findById(20L)).thenReturn(Optional.empty());

            Session result = sessionMapper.toEntity(sessionDto);

            assertThat(result.getUsers()).hasSize(1);
            assertThat(result.getUsers()).containsExactly(user1);
        }

        @Test
        @DisplayName("devrait retourner null si le SessionDto est null")
        void shouldReturnNullWhenDtoIsNull() {
            Session result = sessionMapper.toEntity((SessionDto) null);

            assertThat(result).isNull();
            verifyNoInteractions(teacherService, userService);
        }
    }

    @Nested
    @DisplayName("toDto")
    class ToDto {

        @Test
        @DisplayName("devrait convertir une Session en SessionDto avec teacher_id et liste d'ids users")
        void shouldMapSessionToSessionDto() {
            SessionDto result = sessionMapper.toDto(session);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(session.getId());
            assertThat(result.getName()).isEqualTo(session.getName());
            assertThat(result.getDescription()).isEqualTo(session.getDescription());
            assertThat(result.getTeacher_id()).isEqualTo(teacher.getId());
            assertThat(result.getUsers()).containsExactly(10L, 20L);
        }

        @Test
        @DisplayName("devrait gérer un teacher null")
        void shouldHandleNullTeacher() {
            session.setTeacher(null);

            SessionDto result = sessionMapper.toDto(session);

            assertThat(result.getTeacher_id()).isNull();
        }

        @Test
        @DisplayName("devrait gérer une liste d'users null")
        void shouldHandleNullUsersListInSession() {
            session.setUsers(null);

            SessionDto result = sessionMapper.toDto(session);

            assertThat(result.getUsers()).isNotNull();
            assertThat(result.getUsers()).isEmpty();
        }

        @Test
        @DisplayName("devrait gérer une liste d'users vide")
        void shouldHandleEmptyUsersListInSession() {
            session.setUsers(Collections.emptyList());

            SessionDto result = sessionMapper.toDto(session);

            assertThat(result.getUsers()).isNotNull();
            assertThat(result.getUsers()).isEmpty();
        }

        @Test
        @DisplayName("devrait retourner null si la Session est null")
        void shouldReturnNullWhenSessionIsNull() {
            SessionDto result = sessionMapper.toDto((Session) null);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("toEntity (liste) / toDto (liste)")
    class ListMapping {

        @Test
        @DisplayName("devrait convertir une liste de SessionDto en liste de Session")
        void shouldMapDtoListToEntityList() {
            when(teacherService.findById(1L)).thenReturn(teacher);
            when(userService.findById(10L)).thenReturn(Optional.of(user1));
            when(userService.findById(20L)).thenReturn(Optional.of(user2));

            List<Session> result = sessionMapper.toEntity(Arrays.asList(sessionDto, sessionDto));

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("devrait convertir une liste de Session en liste de SessionDto")
        void shouldMapEntityListToDtoList() {
            List<SessionDto> result = sessionMapper.toDto(Arrays.asList(session, session));

            assertThat(result).hasSize(2);
        }
    }
}