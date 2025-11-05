package com.tien.project_be.dto.request;
import com.tien.project_be.util.Gender;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String phoneNumber;

    private Gender gender;

    private String password;

    private String dateOfBirth;
}
