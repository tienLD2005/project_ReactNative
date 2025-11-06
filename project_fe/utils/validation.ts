/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email không được để trống' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Email không hợp lệ' };
    }

    return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
    if (!password || password.trim() === '') {
        return { isValid: false, error: 'Mật khẩu không được để trống' };
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    return { isValid: true };
};

/**
 * Validate phone number (Vietnam format)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === '') {
        return { isValid: false, error: 'Số điện thoại không được để trống' };
    }

    // Vietnam phone format: 0xxxxxxxxx or +84xxxxxxxxx
    const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Số điện thoại không hợp lệ' };
    }

    return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Tên không được để trống' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Tên phải có ít nhất 2 ký tự' };
    }

    if (name.trim().length > 50) {
        return { isValid: false, error: 'Tên không được quá 50 ký tự' };
    }

    return { isValid: true };
};

/**
 * Validate date of birth
 */
export const validateDateOfBirth = (date: Date): ValidationResult => {
    if (!date) {
        return { isValid: false, error: 'Ngày sinh không được để trống' };
    }

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();

    if (age < 18) {
        return { isValid: false, error: 'Bạn phải trên 18 tuổi' };
    }

    if (age > 100) {
        return { isValid: false, error: 'Ngày sinh không hợp lệ' };
    }

    return { isValid: true };
};

/**
 * Validate all register form fields
 */
export interface RegisterFormData {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth: Date;
    gender: 'MALE' | 'FEMALE';
}

export interface RegisterFormErrors {
    name?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    dateOfBirth?: string;
    gender?: string;
}

export const validateRegisterForm = (data: RegisterFormData): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};

    const nameResult = validateName(data.name);
    if (!nameResult.isValid) {
        errors.name = nameResult.error;
    }

    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
        errors.email = emailResult.error;
    }

    const phoneResult = validatePhoneNumber(data.phoneNumber);
    if (!phoneResult.isValid) {
        errors.phoneNumber = phoneResult.error;
    }

    const passwordResult = validatePassword(data.password);
    if (!passwordResult.isValid) {
        errors.password = passwordResult.error;
    }

    const dobResult = validateDateOfBirth(data.dateOfBirth);
    if (!dobResult.isValid) {
        errors.dateOfBirth = dobResult.error;
    }

    if (!data.gender) {
        errors.gender = 'Vui lòng chọn giới tính';
    }

    return errors;
};

/**
 * Validate login form
 */
export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginFormErrors {
    email?: string;
    password?: string;
}

export const validateLoginForm = (data: LoginFormData): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
        errors.email = emailResult.error;
    }

    const passwordResult = validatePassword(data.password);
    if (!passwordResult.isValid) {
        errors.password = passwordResult.error;
    }

    return errors;
};

