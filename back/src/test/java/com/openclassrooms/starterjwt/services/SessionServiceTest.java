package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        session = new Session();
        session.setId(1L);
        session.setName("Yoga Session");
        session.setUsers(new ArrayList<>());
    }

    @Test
    void create_shouldReturnSavedSession() {
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.create(session);

        assertThat(result).isEqualTo(session);
        verify(sessionRepository).save(session);
    }

    @Test
    void delete_shouldCallRepositoryDeleteById() {
        sessionService.delete(1L);

        verify(sessionRepository).deleteById(1L);
    }

    @Test
    void findAll_shouldReturnListOfSessions() {
        Session session2 = new Session();
        session2.setId(2L);

        when(sessionRepository.findAll()).thenReturn(Arrays.asList(session, session2));

        List<Session> result = sessionService.findAll();

        assertThat(result).hasSize(2);
        verify(sessionRepository).findAll();
    }

    @Test
    void getById_whenSessionExists_shouldReturnSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        Session result = sessionService.getById(1L);

        assertThat(result).isEqualTo(session);
    }

    @Test
    void getById_whenSessionDoesNotExist_shouldReturnNull() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        Session result = sessionService.getById(99L);

        assertThat(result).isNull();
    }

    @Test
    void update_shouldSetIdAndSaveSession() {
        Session updatedSession = new Session();
        updatedSession.setName("Updated Session");

        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);

        Session result = sessionService.update(1L, updatedSession);

        assertThat(updatedSession.getId()).isEqualTo(1L);
        verify(sessionRepository).save(updatedSession);
        assertThat(result).isEqualTo(updatedSession);
    }

    @Test
    void participate_whenSessionAndUserExist_shouldAddUserToSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        sessionService.participate(1L, 1L);

        assertThat(session.getUsers()).contains(user);
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_whenSessionDoesNotExist_shouldThrowNotFoundException() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_whenUserDoesNotExist_shouldThrowNotFoundException() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_whenUserAlreadyParticipates_shouldThrowBadRequestException() {
        session.getUsers().add(user);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_whenUserParticipates_shouldRemoveUserFromSession() {
        session.getUsers().add(user);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(1L, 1L);

        assertThat(session.getUsers()).doesNotContain(user);
        verify(sessionRepository).save(session);
    }

    @Test
    void noLongerParticipate_whenSessionDoesNotExist_shouldThrowNotFoundException() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_whenUserDoesNotParticipate_shouldThrowBadRequestException() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }
}