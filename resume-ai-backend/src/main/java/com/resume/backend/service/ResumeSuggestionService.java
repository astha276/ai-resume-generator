package com.resume.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.resume.backend.dto.JobTargetRequest;
import com.resume.backend.dto.ResumeSuggestionDTO;
import com.resume.backend.dto.ResumeResponseDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeSuggestionService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Autowired
    private ResumeStorageService resumeStorageService;

    @Value("${spring.ai.ollama.chat.options.model:deepseek-r1:1.5b}")
    private String modelName;

    public ResumeSuggestionService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
        this.objectMapper = new ObjectMapper();
    }

    public ResumeSuggestionDTO analyzeResumeForJob(String userEmail, JobTargetRequest request) throws Exception {
        System.out.println("========== ANALYZING RESUME FOR JOB TARGET ==========");
        System.out.println("User: " + userEmail);
        System.out.println("Job Title: " + request.getJobTitle());

        // Get the most recent resume or specified resume
        ResumeResponseDTO resume;
        if (request.getResumeId() != null) {
            resume = resumeStorageService.getResumeById(userEmail, request.getResumeId());
        } else {
            List<ResumeResponseDTO> recent = resumeStorageService.getRecentResumes(userEmail, 1);
            if (recent.isEmpty()) {
                throw new RuntimeException("No resumes found. Please generate a resume first.");
            }
            resume = recent.get(0);
        }

        // Extract resume content
        String resumeContent = objectMapper.writeValueAsString(resume.getGeneratedContent());

        // Build analysis prompt
        String prompt = buildAnalysisPrompt(resumeContent, request);

        // Call AI for analysis
        String aiResponse = callAIAnalysis(prompt);

        // Parse AI response into suggestions
        return parseAnalysisResponse(aiResponse, request.getJobTitle());
    }

    private String buildAnalysisPrompt(String resumeContent, JobTargetRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert resume reviewer and career coach. ");
        prompt.append("Analyze this resume for a ").append(request.getJobTitle()).append(" position.\n\n");

        if (request.getJobDescription() != null && !request.getJobDescription().isEmpty()) {
            prompt.append("Job Description:\n").append(request.getJobDescription()).append("\n\n");
        }

        prompt.append("Resume Content:\n").append(resumeContent).append("\n\n");

        prompt.append("CRITICAL INSTRUCTION: You must respond with ONLY a valid JSON object.\n");
        prompt.append("DO NOT include any explanatory text, markdown, code blocks, or asterisks.\n");
        prompt.append("DO NOT wrap the JSON in ```json or any other markers.\n");
        prompt.append("Your response must start with '{' and end with '}'.\n\n");

        prompt.append("The JSON must follow this exact structure:\n");
        prompt.append("{\n");
        prompt.append("  \"matchPercentage\": 75,\n");
        prompt.append("  \"overallAssessment\": \"Brief overall assessment without line breaks.\",\n");
        prompt.append("  \"skillsToAdd\": [\n");
        prompt.append("    {\"skill\": \"Kubernetes\", \"reason\": \"Required for cloud roles\"}\n");
        prompt.append("  ],\n");
        prompt.append("  \"skillsToImprove\": [\n");
        prompt.append("    {\"skill\": \"Java\", \"currentLevel\": \"Intermediate\", \"recommendedLevel\": \"Advanced\", \"reason\": \"Senior roles require deeper expertise\"}\n");
        prompt.append("  ],\n");
        prompt.append("  \"matchingSkills\": [\"Java\", \"Spring Boot\"],\n");
        prompt.append("  \"missingCriticalSkills\": [\"Docker\", \"Microservices\"],\n");
        prompt.append("  \"experienceGaps\": [\"No team lead experience\"],\n");
        prompt.append("  \"experienceHighlights\": [\"Strong backend development\"],\n");
        prompt.append("  \"recommendedKeywords\": [\"REST API\", \"Agile\", \"CI/CD\"],\n");
        prompt.append("  \"missingKeywords\": [\"Kubernetes\", \"Cloud\"],\n");
        prompt.append("  \"formatSuggestions\": [\"Add more quantifiable achievements\"],\n");
        prompt.append("  \"sectionSuggestions\": {\n");
        prompt.append("    \"summary\": \"Add more impact-focused language\",\n");
        prompt.append("    \"skills\": \"Group skills by category\"\n");
        prompt.append("  },\n");
        prompt.append("  \"improvementActions\": [\n");
        prompt.append("    {\"action\": \"Learn Kubernetes\", \"priority\": \"HIGH\", \"section\": \"skills\", \"description\": \"Critical for cloud-native roles\"}\n");
        prompt.append("  ]\n");
        prompt.append("}\n\n");

        prompt.append("REMEMBER: Your response must start with '{' and contain ONLY the JSON object. No other text.");

        return prompt.toString();
    }

    private String callAIAnalysis(String prompt) {
        try {
            org.springframework.ai.chat.prompt.Prompt aiPrompt = new Prompt(prompt);
            String response = chatClient.prompt(aiPrompt).call().content();

            if (response == null) {
                throw new RuntimeException("AI returned null response");
            }

            return cleanJsonResponse(response);

        } catch (Exception e) {
            System.err.println("Error calling AI for analysis: " + e.getMessage());
            throw new RuntimeException("Failed to analyze resume: " + e.getMessage(), e);
        }
    }

    private String cleanJsonResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return createDefaultAnalysisResponse();
        }

        // Remove markdown code blocks
        response = response.replaceAll("```json", "").replaceAll("```", "");
        response = response.replaceAll("```", "");

        // Remove any text before the first '{'
        int firstBrace = response.indexOf('{');
        if (firstBrace == -1) {
            // If no { found, try to find [
            firstBrace = response.indexOf('[');
            if (firstBrace == -1) {
                System.err.println("No JSON object or array found in response");
                return createDefaultAnalysisResponse();
            }
        }

        // Remove everything before the first brace/bracket
        if (firstBrace > 0) {
            response = response.substring(firstBrace);
        }

        // Find the matching closing brace
        int braceCount = 0;
        int endIndex = -1;
        for (int i = 0; i < response.length(); i++) {
            char c = response.charAt(i);
            if (c == '{' || c == '[') {
                braceCount++;
            } else if (c == '}' || c == ']') {
                braceCount--;
                if (braceCount == 0) {
                    endIndex = i;
                    break;
                }
            }
        }

        if (endIndex != -1) {
            response = response.substring(0, endIndex + 1);
        } else {
            // If we can't find matching braces, try the old method
            int lastBrace = response.lastIndexOf('}');
            if (lastBrace == -1) {
                lastBrace = response.lastIndexOf(']');
            }
            if (lastBrace != -1) {
                response = response.substring(0, lastBrace + 1);
            } else {
                return createDefaultAnalysisResponse();
            }
        }

        // Fix unescaped control characters in strings
        response = escapeControlCharacters(response);

        // Fix common JSON errors
        response = response.replaceAll(",\\s*}", "}"); // Remove trailing commas before }
        response = response.replaceAll(",\\s*]", "]"); // Remove trailing commas before ]

        // Fix missing quotes around field names
        response = response.replaceAll("([{,])\\s*(\\w+)\\s*:", "$1\"$2\":");

        // Fix multiple closing braces
        int openBraces = countOccurrences(response, '{');
        int closeBraces = countOccurrences(response, '}');

        while (closeBraces > openBraces) {
            int lastIndex = response.lastIndexOf('}');
            if (lastIndex != -1) {
                response = response.substring(0, lastIndex) + response.substring(lastIndex + 1);
                closeBraces--;
            } else {
                break;
            }
        }

        while (openBraces > closeBraces) {
            response = response + "}";
            closeBraces++;
        }

        // Final validation - check if it starts with { or [
        response = response.trim();
        if (!response.startsWith("{") && !response.startsWith("[")) {
            System.err.println("Response still doesn't start with { or [. First 100 chars: " +
                    response.substring(0, Math.min(100, response.length())));
            return createDefaultAnalysisResponse();
        }

        return response;
    }

    private String escapeControlCharacters(String json) {
        StringBuilder escaped = new StringBuilder();
        boolean inString = false;

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);

            if (c == '"' && (i == 0 || json.charAt(i - 1) != '\\')) {
                inString = !inString;
                escaped.append(c);
            } else if (inString && (c == '\n' || c == '\r' || c == '\t')) {
                // Escape control characters inside strings
                switch (c) {
                    case '\n':
                        escaped.append("\\n");
                        break;
                    case '\r':
                        escaped.append("\\r");
                        break;
                    case '\t':
                        escaped.append("\\t");
                        break;
                    default:
                        escaped.append(c);
                }
            } else {
                escaped.append(c);
            }
        }

        // If we're still in a string at the end, close it
        if (inString) {
            escaped.append('"');
        }

        return escaped.toString();
    }

    private int countOccurrences(String str, char ch) {
        int count = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == ch) {
                count++;
            }
        }
        return count;
    }

    private String createDefaultAnalysisResponse() {
        return "{"
                + "\"matchPercentage\": 50,"
                + "\"overallAssessment\": \"Analysis completed with some issues. Please review manually.\","
                + "\"skillsToAdd\": [],"
                + "\"skillsToImprove\": [],"
                + "\"matchingSkills\": [],"
                + "\"missingCriticalSkills\": [],"
                + "\"experienceGaps\": [],"
                + "\"experienceHighlights\": [],"
                + "\"recommendedKeywords\": [],"
                + "\"missingKeywords\": [],"
                + "\"formatSuggestions\": [],"
                + "\"sectionSuggestions\": {},"
                + "\"improvementActions\": []"
                + "}";
    }

    private ResumeSuggestionDTO parseAnalysisResponse(String response, String jobTitle) {
        try {
            // Clean the response first
            String cleaned = cleanJsonResponse(response);
            System.out.println("Cleaned JSON: " + cleaned);

            JsonNode root = objectMapper.readTree(cleaned);

            // Parse match percentage
            int matchPercentage = 50;
            if (root.has("matchPercentage") && root.get("matchPercentage").isNumber()) {
                matchPercentage = root.get("matchPercentage").asInt(50);
            }

            // Parse overall assessment
            String overallAssessment = root.has("overallAssessment") ?
                    root.get("overallAssessment").asText("Analysis completed") : "Analysis completed";

            // Build the DTO
            ResumeSuggestionDTO.Builder builder = ResumeSuggestionDTO.builder()
                    .jobTitle(jobTitle)
                    .matchPercentage(matchPercentage)
                    .overallAssessment(overallAssessment)
                    .matchingSkills(parseStringList(root, "matchingSkills"))
                    .missingCriticalSkills(parseStringList(root, "missingCriticalSkills"))
                    .experienceGaps(parseStringList(root, "experienceGaps"))
                    .experienceHighlights(parseStringList(root, "experienceHighlights"))
                    .recommendedKeywords(parseStringList(root, "recommendedKeywords"))
                    .missingKeywords(parseStringList(root, "missingKeywords"))
                    .formatSuggestions(parseStringList(root, "formatSuggestions"));

            // Parse skills to add
            List<ResumeSuggestionDTO.SkillSuggestion> skillsToAdd = new ArrayList<>();
            JsonNode skillsToAddNode = root.path("skillsToAdd");
            if (skillsToAddNode.isArray()) {
                for (JsonNode node : skillsToAddNode) {
                    skillsToAdd.add(ResumeSuggestionDTO.SkillSuggestion.builder()
                            .skill(node.path("skill").asText(""))
                            .reason(node.path("reason").asText(""))
                            .build());
                }
            }
            builder.skillsToAdd(skillsToAdd);

            // Parse skills to improve
            List<ResumeSuggestionDTO.SkillSuggestion> skillsToImprove = new ArrayList<>();
            JsonNode skillsToImproveNode = root.path("skillsToImprove");
            if (skillsToImproveNode.isArray()) {
                for (JsonNode node : skillsToImproveNode) {
                    skillsToImprove.add(ResumeSuggestionDTO.SkillSuggestion.builder()
                            .skill(node.path("skill").asText(""))
                            .currentLevel(node.path("currentLevel").asText(""))
                            .recommendedLevel(node.path("recommendedLevel").asText(""))
                            .reason(node.path("reason").asText(""))
                            .build());
                }
            }
            builder.skillsToImprove(skillsToImprove);

            // Parse improvement actions
            List<ResumeSuggestionDTO.ImprovementAction> actions = new ArrayList<>();
            JsonNode actionsNode = root.path("improvementActions");
            if (actionsNode.isArray()) {
                for (JsonNode node : actionsNode) {
                    actions.add(ResumeSuggestionDTO.ImprovementAction.builder()
                            .action(node.path("action").asText(""))
                            .priority(node.path("priority").asText("MEDIUM"))
                            .section(node.path("section").asText(""))
                            .description(node.path("description").asText(""))
                            .build());
                }
            }
            builder.improvementActions(actions);

            // Parse section suggestions
            Map<String, String> sectionSuggestions = new HashMap<>();
            JsonNode sectionsNode = root.path("sectionSuggestions");
            if (sectionsNode.isObject()) {
                sectionsNode.fields().forEachRemaining(entry ->
                        sectionSuggestions.put(entry.getKey(), entry.getValue().asText())
                );
            }
            builder.sectionSuggestions(sectionSuggestions);

            return builder.build();

        } catch (Exception e) {
            System.err.println("Error parsing AI response: " + e.getMessage());
            e.printStackTrace();

            // Return default/fallback suggestions
            return ResumeSuggestionDTO.builder()
                    .jobTitle(jobTitle)
                    .matchPercentage(50)
                    .overallAssessment("Analysis completed with some issues. Please review manually.")
                    .skillsToAdd(new ArrayList<>())
                    .skillsToImprove(new ArrayList<>())
                    .matchingSkills(new ArrayList<>())
                    .missingCriticalSkills(new ArrayList<>())
                    .experienceGaps(new ArrayList<>())
                    .experienceHighlights(new ArrayList<>())
                    .recommendedKeywords(new ArrayList<>())
                    .missingKeywords(new ArrayList<>())
                    .formatSuggestions(new ArrayList<>())
                    .sectionSuggestions(new HashMap<>())
                    .improvementActions(new ArrayList<>())
                    .build();
        }
    }

    private List<String> parseStringList(JsonNode root, String field) {
        List<String> result = new ArrayList<>();
        JsonNode node = root.path(field);
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                if (item != null && item.isTextual()) {
                    result.add(item.asText());
                }
            }
        }
        return result;
    }
}