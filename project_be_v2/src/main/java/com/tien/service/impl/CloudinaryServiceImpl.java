package com.tien.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tien.service.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "avatars",
                            "resource_type", "image"
                    )
            );
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public String uploadImageFromBase64(String base64Image) {
        try {
            // Remove data:image/...;base64, prefix if present
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.split(",")[1];
            }

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    base64Data,
                    ObjectUtils.asMap(
                            "folder", "avatars",
                            "resource_type", "image"
                    )
            );
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully from base64: {}", imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.error("Error uploading base64 image to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }
}

