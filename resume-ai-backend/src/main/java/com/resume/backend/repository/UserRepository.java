// resposible for talking  to the database and performing operations on the user table
package com.resume.backend.repository;

import com.resume.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;// gives us basic CRUD operations. save, findbyid, delete, findall
import org.springframework.stereotype.Repository;
import java.util.Optional; // safely returns value that may or may not exist

@Repository // tells spring this is a repository class that interacts with the database
public interface UserRepository extends JpaRepository<User, Long> {
    // creating repository for User. Long is the type of the primary key (id) in the User entity.
    // we automatically get save(user), findById(id), delete(user), findAll() methods from JpaRepository.
    Optional<User> findByEmail(String email); // avoids null pointer exception
        // find - select
        // By - condition starts
        // Email → field name in User entity 
    Boolean existsByEmail(String email);


    // Keywords → find, By, And, Or, etc.
    // Entity field names → like email, password


    // better option then this method
        // @Query("SELECT u FROM User u WHERE u.email = :email")
        // User findByEmail(@Param("email") String email);

        // @Query(value = "SELECT * FROM users WHERE email = :email", nativeQuery = true)
        // Optional<User> findUserByEmailNative(String email);
}