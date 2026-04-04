package com.eduassess.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class QuestionItem {

    private String text;
    private String type;
    private String difficulty;
    private Integer marks;
    private List<String> options = new ArrayList<>();
    private String correctAnswer;
    private String correct;
    private String explanation;

    public QuestionItem() {
    }

    public QuestionItem(String text, String type, String difficulty, Integer marks) {
        this.text = text;
        this.type = type;
        this.difficulty = difficulty;
        this.marks = marks;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
        this.correct = correctAnswer;
    }

    @JsonProperty("correct")
    public String getCorrect() {
        return correct;
    }

    public void setCorrect(String correct) {
        this.correct = correct;
        this.correctAnswer = correct;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
