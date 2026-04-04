package com.eduassess.backend.model;

import java.util.ArrayList;
import java.util.List;

public class TopicNode {

    private String name;
    private List<String> subtopics = new ArrayList<>();

    public TopicNode() {
    }

    public TopicNode(String name, List<String> subtopics) {
        this.name = name;
        this.subtopics = subtopics;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getSubtopics() {
        return subtopics;
    }

    public void setSubtopics(List<String> subtopics) {
        this.subtopics = subtopics;
    }
}
