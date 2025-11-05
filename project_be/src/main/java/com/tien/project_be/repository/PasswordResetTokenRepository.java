package com.tien.project_be.repository;


import com.tien.project_be.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;


@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByEmailAndPurposeOrderByIdDesc(String email, String purpose);
    void deleteByEmailAndPurpose(String email, String purpose);
}