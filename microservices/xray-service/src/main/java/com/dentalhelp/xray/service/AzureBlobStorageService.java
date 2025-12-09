package com.dentalhelp.xray.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobContainerClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class AzureBlobStorageService {

    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    public String uploadFile(MultipartFile file) throws IOException {
        BlobContainerClient containerClient = new BlobContainerClientBuilder()
                .connectionString(connectionString)
                .containerName(containerName)
                .buildClient();

        // Generate unique file name
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        // Get blob client
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        // Upload file
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        // Return file URL
        return blobClient.getBlobUrl();
    }

    public void deleteFile(String fileUrl) {
        try {
            BlobContainerClient containerClient = new BlobContainerClientBuilder()
                    .connectionString(connectionString)
                    .containerName(containerName)
                    .buildClient();

            // Extract blob name from URL
            String blobName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            BlobClient blobClient = containerClient.getBlobClient(blobName);
            blobClient.delete();
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to delete blob: " + e.getMessage());
        }
    }
}
