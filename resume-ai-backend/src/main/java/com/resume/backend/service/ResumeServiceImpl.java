package com.resume.backend.service;

import com.resume.backend.entity.User;
import com.resume.backend.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
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
        System.out.println("User Email: " + userEmail);
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
                promptString = this.loadPromptFromFile();
                System.out.println("✓ Prompt loaded successfully");
                System.out.println("Prompt preview: " + promptString.substring(0, Math.min(100, promptString.length())) + "...");
            } catch (IOException e) {
                System.err.println("✗ ERROR loading prompt file: " + e.getMessage());
                e.printStackTrace();
                JSONObject errorJson = new JSONObject();
                errorJson.put("error", "Failed to load prompt template: " + e.getMessage());
                errorJson.put("step", "load_prompt");
                return errorJson.toString();
            }

            // Step 3: Prepare prompt with user description
            System.out.println("Step 3: Preparing prompt with user description...");
            String promptContent = this.putValuesToTemplate(promptString,
                    Map.of("userDescription", userResumeDescription));
            System.out.println("✓ Prompt prepared");
            System.out.println("Final prompt preview: " + promptContent.substring(0, Math.min(100, promptContent.length())) + "...");

            // Step 4: Call AI service
            System.out.println("Step 4: Calling AI service...");
            System.out.println("AI Service URL: " + getAiServiceUrl());

            Prompt prompt = new Prompt(promptContent);
            String aiResponse = null;

            try {
                aiResponse = chatClient.prompt(prompt).call().content();
                System.out.println("✓ AI response received");
                System.out.println("AI response preview: " + (aiResponse != null ? aiResponse.substring(0, Math.min(100, aiResponse.length())) : "NULL"));
            } catch (Exception e) {
                System.err.println("✗ ERROR calling AI service: " + e.getMessage());
                e.printStackTrace();
                JSONObject errorJson = new JSONObject();
                errorJson.put("error", "AI service error: " + e.getMessage());
                errorJson.put("step", "ai_call");
                return errorJson.toString();
            }

            if (aiResponse == null) {
                System.err.println("✗ AI response is null");
                JSONObject errorJson = new JSONObject();
                errorJson.put("error", "AI service returned no response");
                errorJson.put("step", "ai_response_null");
                return errorJson.toString();
            }

            // Step 5: Parse response
            System.out.println("Step 5: Parsing AI response...");
            JSONObject parsedResponse = parseMultipleResponses(aiResponse);
            System.out.println("✓ Response parsed");

            // Step 6: Add metadata
            System.out.println("Step 6: Adding metadata...");
            parsedResponse.put("generatedBy", userEmail);
            parsedResponse.put("generatedAt", LocalDateTime.now().toString());
            parsedResponse.put("status", "success");

            System.out.println("========== RESUME GENERATION COMPLETED SUCCESSFULLY ==========");
            return parsedResponse.toString(2); // Pretty print with indentation

        } catch (Exception e) {
            System.err.println("✗ UNEXPECTED ERROR in resume generation:");
            e.printStackTrace();

            JSONObject errorJson = new JSONObject();
            errorJson.put("error", "Failed to generate resume: " + e.getMessage());
            errorJson.put("exception", e.getClass().getName());
            errorJson.put("step", "unexpected_error");
            errorJson.put("timestamp", LocalDateTime.now().toString());
            return errorJson.toString();
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
            jsonResponse.put("data", JSONObject.NULL);
            jsonResponse.put("warning", "Empty response from AI");
            return jsonResponse;
        }

        int jsonStart = response.indexOf('{');
        int jsonEnd = response.lastIndexOf('}');

        if (jsonStart != -1 && jsonEnd != -1 && jsonStart < jsonEnd) {
            String jsonContent = response.substring(jsonStart, jsonEnd + 1).trim();
            try {
                JSONObject dataContent = new JSONObject(jsonContent);
                jsonResponse.put("data", dataContent);
                System.out.println("Successfully parsed JSON from response");
            } catch (Exception e) {
                jsonResponse.put("data", JSONObject.NULL);
                jsonResponse.put("parse_error", e.getMessage());
                jsonResponse.put("raw_response", response.substring(0, Math.min(200, response.length())));
                System.err.println("Invalid JSON format: " + e.getMessage());
            }
        } else {
            jsonResponse.put("data", JSONObject.NULL);
            jsonResponse.put("warning", "No JSON object found in response");
            jsonResponse.put("raw_response", response.substring(0, Math.min(200, response.length())));
        }

        return jsonResponse;
    }

    private JSONObject createErrorResponse(String message) {
        JSONObject error = new JSONObject();
        error.put("error", message);
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", "error");
        return error;
    }
}