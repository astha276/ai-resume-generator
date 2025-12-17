package com.resume.backend.service;

import org.json.JSONObject;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ChatClient chatClient;

    public ResumeServiceImpl(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public String generateResumeResponse(String userResumeDescription) {
        System.out.println(">>> in generateResumeResponse, desc = " + userResumeDescription);

        String promptString;
        try {
            promptString = this.loadPromptFromFile("resume_prompt.txt");
        } catch (IOException e) {
            System.err.println("Error loading prompt file: " + e.getMessage());
            return errorJson("Failed to load prompt template").toString();
        }

        String promptContent =
                this.putValuesToTemplate(promptString,
                        Map.of("userDescription", userResumeDescription));

        Prompt prompt = new Prompt(promptContent);
        String response = chatClient.prompt(prompt).call().content();

        JSONObject parsed = parseMultipleResponses(response);

        // Return JSON text so Spring can write it directly to the response body
        return parsed.toString();
    }

    // Read text file from classpath: src/main/resources/resume_prompt.txt
    String loadPromptFromFile(String filename) throws IOException {
        File file = new ClassPathResource(filename).getFile();
        Path path = file.toPath();
        return Files.readString(path);
    }

    String putValuesToTemplate(String template, Map<String, String> values) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            template = template.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return template;
    }

    public static JSONObject parseMultipleResponses(String response) {
        JSONObject jsonResponse = new JSONObject();

        int jsonStart = response.indexOf('{');
        int jsonEnd = response.lastIndexOf('}');
        if (jsonStart != -1 && jsonEnd != -1 && jsonStart < jsonEnd) {
            String jsonContent = response.substring(jsonStart, jsonEnd + 1).trim();
            try {
                JSONObject dataContent = new JSONObject(jsonContent);
                jsonResponse.put("data", dataContent);
            } catch (Exception e) {
                jsonResponse.put("data", JSONObject.NULL);
                System.err.println("Invalid JSON format in the response: " + e.getMessage());
            }
        } else {
            jsonResponse.put("data", JSONObject.NULL);
        }

        return jsonResponse;
    }

    private JSONObject errorJson(String message) {
        JSONObject json = new JSONObject();
        json.put("error", message);
        return json;
    }
}
