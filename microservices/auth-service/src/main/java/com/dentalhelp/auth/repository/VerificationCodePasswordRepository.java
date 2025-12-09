package com.dentalhelp.auth.repository;

import com.dentalhelp.auth.model.VerificationCodePasswordChanging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodePasswordRepository extends JpaRepository<VerificationCodePasswordChanging, Long> {
    Optional<VerificationCodePasswordChanging> findByEmail(String email);
    void deleteByEmail(String email);
}
