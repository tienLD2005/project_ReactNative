package com.tien.project_be.service;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
}
