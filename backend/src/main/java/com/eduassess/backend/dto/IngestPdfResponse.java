package com.eduassess.backend.dto;

import com.eduassess.backend.model.QuestionItem;
import com.eduassess.backend.model.TopicNode;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class IngestPdfResponse {

    private boolean isMock;
    private List<TopicNode> topics = new ArrayList<>();
    private List<QuestionItem> questions = new ArrayList<>();

    @JsonProperty("isMock")
    public boolean isMock() {
        return isMock;
    }

    @JsonProperty("isMock")
    public void setMock(boolean mock) {
        isMock = mock;
    }

    public List<TopicNode> getTopics() {
        return topics;
    }

    public void setTopics(List<TopicNode> topics) {
        this.topics = topics;
    }

    public List<QuestionItem> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionItem> questions) {
        this.questions = questions;
    }
}
