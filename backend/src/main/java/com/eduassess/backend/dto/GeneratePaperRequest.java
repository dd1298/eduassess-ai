package com.eduassess.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

public class GeneratePaperRequest {

    private String title;
    private String className;

    @NotBlank(message = "Subject is required")
    private String subject;

    private List<String> topics = new ArrayList<>();
    private DifficultyDistribution difficulty = new DifficultyDistribution();
    private Integer totalMarks = 100;
    private Integer duration = 60;
    private List<String> questionTypes = new ArrayList<>();
    private String format = "CBSE";
    private Integer sets = 1;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }

    public DifficultyDistribution getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyDistribution difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public List<String> getQuestionTypes() {
        return questionTypes;
    }

    public void setQuestionTypes(List<String> questionTypes) {
        this.questionTypes = questionTypes;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }
}
