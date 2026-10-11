package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private UserMapper userMapper;

    private User user;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        userMapper = new UserMapperImpl();

        user = User.builder()
                .id(1L)
                .email("yoga@studio.com")
                .firstName("Marie")
                .lastName("Dupont")
                .password("password123")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail("yoga@studio.com");
        userDto.setFirstName("Marie");
        userDto.setLastName("Dupont");
        userDto.setPassword("password123");
        userDto.setAdmin(false);
        userDto.setCreatedAt(LocalDateTime.now());
        userDto.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("toDto (entité unique)")
    class ToDto {

        @Test
        @DisplayName("devrait convertir un User en UserDto")
        void shouldMapUserToUserDto() {
            UserDto result = userMapper.toDto(user);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(user.getId());
            assertThat(result.getEmail()).isEqualTo(user.getEmail());
            assertThat(result.getFirstName()).isEqualTo(user.getFirstName());
            assertThat(result.getLastName()).isEqualTo(user.getLastName());
            assertThat(result.getPassword()).isEqualTo(user.getPassword());
            assertThat(result.isAdmin()).isEqualTo(user.isAdmin());
        }

        @Test
        @DisplayName("devrait retourner null si le User est null")
        void shouldReturnNullWhenUserIsNull() {
            UserDto result = userMapper.toDto((User) null);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("toEntity (entité unique)")
    class ToEntity {

        @Test
        @DisplayName("devrait convertir un UserDto en User")
        void shouldMapUserDtoToUser() {
            User result = userMapper.toEntity(userDto);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(userDto.getId());
            assertThat(result.getEmail()).isEqualTo(userDto.getEmail());
            assertThat(result.getFirstName()).isEqualTo(userDto.getFirstName());
            assertThat(result.getLastName()).isEqualTo(userDto.getLastName());
            assertThat(result.getPassword()).isEqualTo(userDto.getPassword());
            assertThat(result.isAdmin()).isEqualTo(userDto.isAdmin());
        }

        @Test
        @DisplayName("devrait retourner null si le UserDto est null")
        void shouldReturnNullWhenUserDtoIsNull() {
            User result = userMapper.toEntity((UserDto) null);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("toDto (liste)")
    class ToDtoList {

        @Test
        @DisplayName("devrait convertir une liste de User en liste de UserDto")
        void shouldMapUserListToUserDtoList() {
            List<User> users = Arrays.asList(user, user);

            List<UserDto> result = userMapper.toDto(users);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getEmail()).isEqualTo("yoga@studio.com");
        }

        @Test
        @DisplayName("devrait retourner null si la liste de User est null")
        void shouldReturnNullWhenUserListIsNull() {
            List<UserDto> result = userMapper.toDto((List<User>) null);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("devrait retourner une liste vide si la liste de User est vide")
        void shouldReturnEmptyListWhenUserListIsEmpty() {
            List<UserDto> result = userMapper.toDto(Collections.emptyList());

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("toEntity (liste)")
    class ToEntityList {

        @Test
        @DisplayName("devrait convertir une liste de UserDto en liste de User")
        void shouldMapUserDtoListToUserList() {
            List<UserDto> dtos = Arrays.asList(userDto, userDto);

            List<User> result = userMapper.toEntity(dtos);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getEmail()).isEqualTo("yoga@studio.com");
        }

        @Test
        @DisplayName("devrait retourner null si la liste de UserDto est null")
        void shouldReturnNullWhenDtoListIsNull() {
            List<User> result = userMapper.toEntity((List<UserDto>) null);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("devrait retourner une liste vide si la liste de UserDto est vide")
        void shouldReturnEmptyListWhenDtoListIsEmpty() {
            List<User> result = userMapper.toEntity(Collections.emptyList());

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }
}