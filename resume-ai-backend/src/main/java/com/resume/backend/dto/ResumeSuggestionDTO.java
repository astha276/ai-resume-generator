package com.resume.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResumeSuggestionDTO {
    private String jobTitle;
    private int matchPercentage;
    private String overallAssessment;
    private List<SkillSuggestion> skillsToAdd;
    private List<SkillSuggestion> skillsToImprove;
    private List<String> matchingSkills;
    private List<String> missingCriticalSkills;
    private List<String> experienceGaps;
    private List<String> experienceHighlights;
    private List<String> recommendedKeywords;
    private List<String> missingKeywords;
    private List<String> formatSuggestions;
    private Map<String, String> sectionSuggestions;
    private List<ImprovementAction> improvementActions;

    // Default constructor
    public ResumeSuggestionDTO() {}

    // All-args constructor for builder
    private ResumeSuggestionDTO(Builder builder) {
        this.jobTitle = builder.jobTitle;
        this.matchPercentage = builder.matchPercentage;
        this.overallAssessment = builder.overallAssessment;
        this.skillsToAdd = builder.skillsToAdd;
        this.skillsToImprove = builder.skillsToImprove;
        this.matchingSkills = builder.matchingSkills;
        this.missingCriticalSkills = builder.missingCriticalSkills;
        this.experienceGaps = builder.experienceGaps;
        this.experienceHighlights = builder.experienceHighlights;
        this.recommendedKeywords = builder.recommendedKeywords;
        this.missingKeywords = builder.missingKeywords;
        this.formatSuggestions = builder.formatSuggestions;
        this.sectionSuggestions = builder.sectionSuggestions;
        this.improvementActions = builder.improvementActions;
    }

    // Getters and setters
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getOverallAssessment() { return overallAssessment; }
    public void setOverallAssessment(String overallAssessment) { this.overallAssessment = overallAssessment; }

    public List<SkillSuggestion> getSkillsToAdd() { return skillsToAdd; }
    public void setSkillsToAdd(List<SkillSuggestion> skillsToAdd) { this.skillsToAdd = skillsToAdd; }

    public List<SkillSuggestion> getSkillsToImprove() { return skillsToImprove; }
    public void setSkillsToImprove(List<SkillSuggestion> skillsToImprove) { this.skillsToImprove = skillsToImprove; }

    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }

    public List<String> getMissingCriticalSkills() { return missingCriticalSkills; }
    public void setMissingCriticalSkills(List<String> missingCriticalSkills) { this.missingCriticalSkills = missingCriticalSkills; }

    public List<String> getExperienceGaps() { return experienceGaps; }
    public void setExperienceGaps(List<String> experienceGaps) { this.experienceGaps = experienceGaps; }

    public List<String> getExperienceHighlights() { return experienceHighlights; }
    public void setExperienceHighlights(List<String> experienceHighlights) { this.experienceHighlights = experienceHighlights; }

    public List<String> getRecommendedKeywords() { return recommendedKeywords; }
    public void setRecommendedKeywords(List<String> recommendedKeywords) { this.recommendedKeywords = recommendedKeywords; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public List<String> getFormatSuggestions() { return formatSuggestions; }
    public void setFormatSuggestions(List<String> formatSuggestions) { this.formatSuggestions = formatSuggestions; }

    public Map<String, String> getSectionSuggestions() { return sectionSuggestions; }
    public void setSectionSuggestions(Map<String, String> sectionSuggestions) { this.sectionSuggestions = sectionSuggestions; }

    public List<ImprovementAction> getImprovementActions() { return improvementActions; }
    public void setImprovementActions(List<ImprovementAction> improvementActions) { this.improvementActions = improvementActions; }

    // Builder class
    public static class Builder {
        private String jobTitle;
        private int matchPercentage;
        private String overallAssessment;
        private List<SkillSuggestion> skillsToAdd;
        private List<SkillSuggestion> skillsToImprove;
        private List<String> matchingSkills;
        private List<String> missingCriticalSkills;
        private List<String> experienceGaps;
        private List<String> experienceHighlights;
        private List<String> recommendedKeywords;
        private List<String> missingKeywords;
        private List<String> formatSuggestions;
        private Map<String, String> sectionSuggestions;
        private List<ImprovementAction> improvementActions;

        public Builder jobTitle(String jobTitle) { this.jobTitle = jobTitle; return this; }
        public Builder matchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; return this; }
        public Builder overallAssessment(String overallAssessment) { this.overallAssessment = overallAssessment; return this; }
        public Builder skillsToAdd(List<SkillSuggestion> skillsToAdd) { this.skillsToAdd = skillsToAdd; return this; }
        public Builder skillsToImprove(List<SkillSuggestion> skillsToImprove) { this.skillsToImprove = skillsToImprove; return this; }
        public Builder matchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; return this; }
        public Builder missingCriticalSkills(List<String> missingCriticalSkills) { this.missingCriticalSkills = missingCriticalSkills; return this; }
        public Builder experienceGaps(List<String> experienceGaps) { this.experienceGaps = experienceGaps; return this; }
        public Builder experienceHighlights(List<String> experienceHighlights) { this.experienceHighlights = experienceHighlights; return this; }
        public Builder recommendedKeywords(List<String> recommendedKeywords) { this.recommendedKeywords = recommendedKeywords; return this; }
        public Builder missingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; return this; }
        public Builder formatSuggestions(List<String> formatSuggestions) { this.formatSuggestions = formatSuggestions; return this; }
        public Builder sectionSuggestions(Map<String, String> sectionSuggestions) { this.sectionSuggestions = sectionSuggestions; return this; }
        public Builder improvementActions(List<ImprovementAction> improvementActions) { this.improvementActions = improvementActions; return this; }

        public ResumeSuggestionDTO build() {
            return new ResumeSuggestionDTO(this);
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SkillSuggestion {
        private String skill;
        private String currentLevel;
        private String recommendedLevel;
        private String reason;

        public SkillSuggestion() {}

        private SkillSuggestion(Builder builder) {
            this.skill = builder.skill;
            this.currentLevel = builder.currentLevel;
            this.recommendedLevel = builder.recommendedLevel;
            this.reason = builder.reason;
        }

        // Getters and setters
        public String getSkill() { return skill; }
        public void setSkill(String skill) { this.skill = skill; }
        public String getCurrentLevel() { return currentLevel; }
        public void setCurrentLevel(String currentLevel) { this.currentLevel = currentLevel; }
        public String getRecommendedLevel() { return recommendedLevel; }
        public void setRecommendedLevel(String recommendedLevel) { this.recommendedLevel = recommendedLevel; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public static class Builder {
            private String skill;
            private String currentLevel;
            private String recommendedLevel;
            private String reason;

            public Builder skill(String skill) { this.skill = skill; return this; }
            public Builder currentLevel(String currentLevel) { this.currentLevel = currentLevel; return this; }
            public Builder recommendedLevel(String recommendedLevel) { this.recommendedLevel = recommendedLevel; return this; }
            public Builder reason(String reason) { this.reason = reason; return this; }

            public SkillSuggestion build() {
                return new SkillSuggestion(this);
            }
        }

        public static Builder builder() {
            return new Builder();
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ImprovementAction {
        private String action;
        private String priority;
        private String section;
        private String description;

        public ImprovementAction() {}

        private ImprovementAction(Builder builder) {
            this.action = builder.action;
            this.priority = builder.priority;
            this.section = builder.section;
            this.description = builder.description;
        }

        // Getters and setters
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public static class Builder {
            private String action;
            private String priority;
            private String section;
            private String description;

            public Builder action(String action) { this.action = action; return this; }
            public Builder priority(String priority) { this.priority = priority; return this; }
            public Builder section(String section) { this.section = section; return this; }
            public Builder description(String description) { this.description = description; return this; }

            public ImprovementAction build() {
                return new ImprovementAction(this);
            }
        }

        public static Builder builder() {
            return new Builder();
        }
    }
}