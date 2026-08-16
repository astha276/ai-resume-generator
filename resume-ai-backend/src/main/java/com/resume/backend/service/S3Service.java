package com.resume.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.time.Duration;

@Service // tells Spring this is a service class — same pattern as ResumeService, AuthService
public class S3Service {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    // Uploads a file (as raw bytes) to S3 under the given key (like a filename/path)
    public void uploadFile(byte[] fileBytes, String key) {
        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .build();

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.putObject(putRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(fileBytes));

        s3Client.close();
    }

    // Generates a temporary, secure download link for a file — valid for 15 minutes
    public String generatePresignedUrl(String key) {
        S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .build();

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(getObjectRequest)
                .build();

        String url = presigner.presignGetObject(presignRequest).url().toString();

        presigner.close();
        return url;
    }
}
