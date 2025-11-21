package com.example.BackEnd.controller;

import com.example.BackEnd.dto.ApiResponse;
import com.example.BackEnd.dto.FileUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String ext = StringUtils.getFilenameExtension(originalFilename);
            if (ext == null)
                ext = "";
            ext = ext.toLowerCase();
            // Validate file type and size
            if ((ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png"))) {
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("Image file size must be <= 5MB"));
                }
            } else if (ext.equals("mp4")) {
                if (file.getSize() > 50 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("Video file size must be <= 50MB"));
                }
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Only .jpg, .png, .mp4 files are allowed"));
            }
            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            // Lưu file với tên random tránh trùng
            String filename = UUID.randomUUID().toString() + "." + ext;
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath);
            // Trả về URL (giả sử static resource mapping /uploads/**)
            String fileUrl = "/uploads/" + filename;
            return ResponseEntity
                    .ok(ApiResponse.success("File uploaded successfully", new FileUploadResponse(fileUrl)));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("File upload failed: " + e.getMessage()));
        }
    }
}