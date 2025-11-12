package com.tien.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Pattern(regexp = "^(|0\\d{9})$", message = "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số")
    private String phoneNumber;

    private LocalDate dateOfBirth;

    private String gender;

    @Size(max = 500, message = "Avatar URL tối đa 500 ký tự")
    private String avatar;
}

