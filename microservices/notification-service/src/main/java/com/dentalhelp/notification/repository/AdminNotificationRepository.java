package com.dentalhelp.notification.repository;

import com.dentalhelp.notification.model.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findAllByOrderByNotificationIdDesc();
    Optional<AdminNotification> findByNotificationId(Long notificationId);
}
