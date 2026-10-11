package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private UserDetailsImpl userDetails;
    private User user;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("user@test.com");
        loginRequest.setPassword("password123");

        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encodedPassword")
                .build();

        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setAdmin(true);
    }

    @Test
    void authenticate_shouldReturnJwtResponse_whenCredentialsAreValid() {
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("fake-jwt-token");
        when(userService.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        JwtResponse result = authService.authenticate(loginRequest);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("fake-jwt-token");
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("user@test.com");
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getAdmin()).isTrue();

        verify(authenticationManager).authenticate(any());
        verify(jwtUtils).generateJwtToken(authentication);
        verify(userService).findByEmail("user@test.com");

        // Vérifie que le contexte de sécurité a bien été mis à jour
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(authentication);
    }

    @Test
    void authenticate_whenUserNotFound_shouldThrowRuntimeException() {
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("fake-jwt-token");
        when(userService.findByEmail("user@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void authenticate_whenNotAdmin_shouldReturnJwtResponseWithAdminFalse() {
        user.setAdmin(false);

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("fake-jwt-token");
        when(userService.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        JwtResponse result = authService.authenticate(loginRequest);

        assertThat(result.getAdmin()).isFalse();
    }
}