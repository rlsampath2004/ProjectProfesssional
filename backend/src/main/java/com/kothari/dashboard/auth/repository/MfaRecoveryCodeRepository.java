package com.kothari.dashboard.auth.repository;

import com.kothari.dashboard.auth.entity.MfaRecoveryCode;
import com.kothari.dashboard.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MfaRecoveryCodeRepository extends JpaRepository<MfaRecoveryCode, UUID> {

    List<MfaRecoveryCode> findByUserAndUsedFalse(User user);

    Optional<MfaRecoveryCode> findByUserAndCodeHashAndUsedFalse(User user, String codeHash);
}

