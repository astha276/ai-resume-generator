package com.resume.backend.service;

import com.resume.backend.entity.User;
import com.resume.backend.repository.UserRepository;
import com.resume.backend.service.ResumeStorageService;
import org.json.JSONObject;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ChatClient chatClient;
    private final UserRepository userRepository;

    @Autowired
    private ResumeStorageService resumeStorageService;

    public ResumeServiceImpl(ChatClient.Builder builder,
                             UserRepository userRepository) {
        System.out.println(">>> ResumeServiceImpl constructor called");
        this.chatClient = builder.build();
        this.userRepository = userRepository;
        System.out.println(">>> ChatClient initialized: " + (chatClient != null));
        System.out.println(">>> UserRepository initialized: " + (userRepository != null));
    }

    @Override
    public String generateResumeResponse(String userResumeDescription, String userEmail) {
        System.out.println("========== RESUME GENERATION STARTED ==========");
        System.out.println("User: " + userEmail);
        System.out.println("Description: " + userResumeDescription);

        try {
            // Step 1: Find user
            System.out.println("Step 1: Looking up user in database...");
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
            System.out.println("✓ User found: " + user.getFullName());

            // Step 2: Load prompt file
            System.out.println("Step 2: Loading prompt file...");
            String promptString;
            try {
                promptString = loadPromptFromFile();
                System.out.println("✓ Prompt loaded successfully");
                System.out.println("Prompt preview: " + promptString.substring(0, Math.min(100, promptString.length())) + "...");
            } catch (IOException e) {
                System.err.println("✗ ERROR loading prompt file: " + e.getMessage());
                e.printStackTrace();
                return createErrorResponse("Failed to load prompt template: " + e.getMessage()).toString();
            }

            // Step 3: Prepare prompt with user description
            System.out.println("Step 3: Preparing prompt with user description...");
            String fullPrompt = putValuesToTemplate(promptString,
                    Map.of("userDescription", userResumeDescription));
            System.out.println("✓ Prompt prepared");
            System.out.println("Final prompt preview: " + fullPrompt.substring(0, Math.min(100, fullPrompt.length())) + "...");

            // Step 4: Call AI service
            System.out.println("Step 4: Calling AI service...");
            System.out.println("AI Service URL: " + getAiServiceUrl());

            Prompt prompt = new Prompt(fullPrompt);
            String ollamaResponse;

            try {
                ollamaResponse = chatClient.prompt(prompt).call().content();
                System.out.println("✓ AI response received");
                System.out.println("AI response preview: " + (ollamaResponse != null ? ollamaResponse.substring(0, Math.min(100, ollamaResponse.length())) : "NULL"));
            } catch (Exception e) {
                System.err.println("✗ ERROR calling AI service: " + e.getMessage());
                e.printStackTrace();
                return createErrorResponse("AI service error: " + e.getMessage()).toString();
            }

            if (ollamaResponse == null) {
                System.err.println("✗ AI response is null");
                return createErrorResponse("AI service returned no response").toString();
            }

            // Step 5: Parse response
            System.out.println("Step 5: Parsing AI response...");
            JSONObject parsedResponse = parseMultipleResponses(ollamaResponse);
            System.out.println("✓ Response parsed");

            // Step 6: Add metadata
            System.out.println("Step 6: Adding metadata...");
            parsedResponse.put("generatedBy", userEmail);
            parsedResponse.put("generatedAt", LocalDateTime.now().toString());
            parsedResponse.put("status", "success");

            String finalResponse = parsedResponse.toString(2); // Pretty print with indentation

            // Step 7: AUTO-SAVE to database
            System.out.println("Step 7: Auto-saving to database...");
            try {
                // Create title from description
                String title = userResumeDescription.length() > 60
                        ? userResumeDescription.substring(0, 60) + "..."
                        : userResumeDescription;

                // Save to database
                resumeStorageService.saveGeneratedResume(
                        userEmail,
                        userResumeDescription,
                        finalResponse,
                        title
                );

                System.out.println("✅ Resume auto-saved successfully!");

            } catch (Exception e) {
                System.err.println("⚠️ Auto-save failed: " + e.getMessage());
                // Continue even if save fails
            }

            System.out.println("========== RESUME GENERATION COMPLETED SUCCESSFULLY ==========");
            return finalResponse;

        } catch (Exception e) {
            System.err.println("✗ UNEXPECTED ERROR in resume generation:");
            e.printStackTrace();
            return createErrorResponse("Failed to generate resume: " + e.getMessage()).toString();
        }
    }

    private String getAiServiceUrl() {
        try {
            // Try to get Ollama URL from properties
            return System.getProperty("spring.ai.ollama.base-url", "http://localhost:11434");
        } catch (Exception e) {
            return "unknown";
        }
    }

    String loadPromptFromFile() throws IOException {
        System.out.println("Attempting to load prompt from: src/main/resources/resume_prompt.txt");
        File file = new ClassPathResource("resume_prompt.txt").getFile();
        System.out.println("File found at: " + file.getAbsolutePath());
        Path path = file.toPath();
        String content = Files.readString(path);
        System.out.println("File size: " + content.length() + " characters");
        return content;
    }

    String putValuesToTemplate(String template, Map<String, String> values) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            String placeholder = "{" + entry.getKey() + "}";
            if (template.contains(placeholder)) {
                template = template.replace(placeholder, entry.getValue());
                System.out.println("Replaced placeholder: " + placeholder);
            } else {
                System.out.println("Warning: Placeholder not found: " + placeholder);
            }
        }
        return template;
    }

    public static JSONObject parseMultipleResponses(String response) {
        JSONObject jsonResponse = new JSONObject();

        if (response == null || response.trim().isEmpty()) {
            jsonResponse.put("error", "Empty response from AI");
            return jsonResponse;
        }

        try {
            // First, try to clean the response
            String cleaned = cleanJsonResponse(response);
            System.out.println("Cleaned response: " + cleaned);

            // Try to find JSON object in the response
            int jsonStart = cleaned.indexOf('{');
            int jsonEnd = cleaned.lastIndexOf('}');

            if (jsonStart != -1 && jsonEnd != -1 && jsonStart < jsonEnd) {
                String jsonContent = cleaned.substring(jsonStart, jsonEnd + 1).trim();
                System.out.println("Extracted JSON content: " + jsonContent);

                try {
                    JSONObject dataContent = new JSONObject(jsonContent);
                    jsonResponse.put("data", dataContent);
                    jsonResponse.put("status", "success");
                    System.out.println("✓ Successfully parsed JSON");
                } catch (Exception e) {
                    System.err.println("✗ Error parsing JSON: " + e.getMessage());
                    jsonResponse.put("data", JSONObject.NULL);
                    jsonResponse.put("parse_error", e.getMessage());
                    jsonResponse.put("raw_response", response);
                    jsonResponse.put("status", "parse_error");
                }
            } else {
                jsonResponse.put("data", JSONObject.NULL);
                jsonResponse.put("error", "No JSON object found");
                jsonResponse.put("raw_response", response);
                jsonResponse.put("status", "no_json");
            }
        } catch (Exception e) {
            System.err.println("✗ Unexpected error in parseMultipleResponses: " + e.getMessage());
            e.printStackTrace();
            jsonResponse.put("data", JSONObject.NULL);
            jsonResponse.put("error", e.getMessage());
            jsonResponse.put("raw_response", response);
            jsonResponse.put("status", "error");
        }

        return jsonResponse;
    }

    private static String cleanJsonResponse(String response) {
        // Remove markdown code blocks
        response = response.replaceAll("```json", "").replaceAll("```", "");

        // Fix common JSON errors
        response = response.replaceAll(",\\s*}", "}"); // Remove trailing commas
        response = response.replaceAll(",\\s*]", "]"); // Remove trailing commas in arrays

        // Fix the specific error we saw: {"fullName": {"John Doe", ...}}
        response = response.replaceAll("\\{\\s*\"([^\"]+)\"\\s*:\\s*\\{\\s*\"([^\"]+)\"\\s*,", "{\"$1\": \"$2\",");

        return response.trim();
    }

    private JSONObject createErrorResponse(String message) {
        JSONObject error = new JSONObject();
        error.put("error", message);
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", "error");
        return error;
    }
}