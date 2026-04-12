// blueprint for the user table in my database
package com.resume.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity //this class will be stored as a table in my database
@Table(name = "users")
@Data // automatically creates getters and setters
@NoArgsConstructor // creates an empty constructor to add new users
public class User implements UserDetails {
    // implementing UserDetails to tell spring security to use email password to login people

    @Id // mark this field as the primary key of the table
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto generates id by incrementing in database
    private Long id;

    @Column(nullable = false, unique = true) // email cant be null and is unique and is a column
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist // automatically take current time and date when creating the user
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate // on update
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override // providing authority(role_user) to people who sign in
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    // email is the username for spring security to login
    @Override
    public String getUsername() {
        return email;
    }

    // for the people who sign in to the system, they are not expired, locked, or disabled, so we return true for all of these
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}