package com.eduassess.backend.dto;

import com.eduassess.backend.model.QuestionItem;

import java.util.ArrayList;
import java.util.List;

public class QuestionSet {

    private String setName;
    private List<QuestionItem> questions = new ArrayList<>();

    public QuestionSet() {
    }

    public QuestionSet(String setName, List<QuestionItem> questions) {
        this.setName = setName;
        this.questions = questions;
    }

    public String getSetName() {
        return setName;
    }

    public void setSetName(String setName) {
        this.setName = setName;
    }

    public List<QuestionItem> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionItem> questions) {
        this.questions = questions;
    }
}
