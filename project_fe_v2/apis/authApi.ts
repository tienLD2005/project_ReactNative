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

// Upload avatar (multipart form data)
export const uploadAvatar = async (imageUri: string): Promise<any> => {
    try {
        const formData = new FormData();
        
        // Get file name and type from URI
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
            uri: imageUri,
            type: type,
            name: filename,
        } as any);

        const response = await axiosInstance.post("auth/upload-avatar", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Upload avatar from base64
export const uploadAvatarBase64 = async (base64Image: string): Promise<any> => {
    try {
        const response = await axiosInstance.post("auth/upload-avatar-base64", {
            image: base64Image,
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Update profile
export const updateProfile = async (data: {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    avatar?: string;
}): Promise<any> => {
    try {
        const response = await axiosInstance.put("auth/profile", data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

