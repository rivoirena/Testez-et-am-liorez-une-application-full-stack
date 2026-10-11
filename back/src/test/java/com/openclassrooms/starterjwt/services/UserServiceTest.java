package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.EmailAlreadyExistsException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("user@test.com", "Doe", "John", "encodedPassword", false);
        testUser.setId(1L);
    }

    @Test
    void delete_shouldCallRepositoryDeleteById() {
        userService.delete(1L);

        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void findById_whenUserExists_shouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("user@test.com");
    }

    @Test
    void findById_whenUserDoesNotExist_shouldReturnEmpty() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<User> result = userService.findById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void findByEmail_whenUserExists_shouldReturnUser() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findByEmail("user@test.com");

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
    }

    @Test
    void findByEmail_whenUserDoesNotExist_shouldReturnEmpty() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByEmail("unknown@test.com");

        assertThat(result).isEmpty();
    }

    @Test
    void createUser_whenEmailDoesNotExist_shouldCreateAndReturnUser() {
        SignupRequest request = new SignupRequest();
        request.setEmail("new@test.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password123");

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.createUser(request);

        assertThat(result.getEmail()).isEqualTo("new@test.com");
        assertThat(result.getPassword()).isEqualTo("encodedPassword123");
        assertThat(result.isAdmin()).isFalse();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void createUser_shouldMapFirstNameAndLastNameCorrectly() {
        // Ce test vérifie spécifiquement qu'il n'y a pas d'inversion
        // entre firstName et lastName lors du mapping DTO -> Entity
        SignupRequest request = new SignupRequest();
        request.setEmail("new@test.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.createUser(request);

        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
    }

    @Test
    void createUser_whenEmailAlreadyExists_shouldThrowException() {
        SignupRequest request = new SignupRequest();
        request.setEmail("existing@test.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password123");

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> userService.createUser(request));

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
}