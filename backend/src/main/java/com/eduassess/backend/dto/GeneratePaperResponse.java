package com.eduassess.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class GeneratePaperResponse {

    private List<QuestionSet> sets = new ArrayList<>();

    public GeneratePaperResponse() {
    }

    public GeneratePaperResponse(List<QuestionSet> sets) {
        this.sets = sets;
    }

    public List<QuestionSet> getSets() {
        return sets;
    }

    public void setSets(List<QuestionSet> sets) {
        this.sets = sets;
    }
}
