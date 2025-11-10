import axiosInstance from "@/utils/axiosInstance";

// Register user (without password)
export const register = async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
}): Promise<any> => {
    try {
        const response = await axiosInstance.post("auth/register", data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Login user
export const login = async (email: string, password: string): Promise<any> => {
    try {
        const response = await axiosInstance.post("auth/login", {
            email,
            password,
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Verify OTP
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<any> => {
    try {
        const response = await axiosInstance.post("auth/verify-otp", {
            phoneNumber,
            otp,
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Resend OTP
export const resendOtp = async (phoneNumber: string): Promise<any> => {
    try {
        const response = await axiosInstance.post("auth/resend-otp", {
            phoneNumber,
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Complete registration (set password)
export const completeRegistration = async (phoneNumber: string, password: string): Promise<any> => {
    try {
        const response = await axiosInstance.post("auth/complete-registration", {
            phoneNumber,
            password,
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

