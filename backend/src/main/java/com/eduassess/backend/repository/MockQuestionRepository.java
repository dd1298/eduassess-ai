package com.eduassess.backend.repository;

import com.eduassess.backend.dto.GeneratePaperRequest;
import com.eduassess.backend.dto.GeneratePaperResponse;
import com.eduassess.backend.dto.IngestPdfResponse;
import com.eduassess.backend.dto.QuestionSet;
import com.eduassess.backend.model.QuestionItem;
import com.eduassess.backend.model.TopicNode;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MockQuestionRepository {

    public IngestPdfResponse mockIngestionResult() {
        IngestPdfResponse response = new IngestPdfResponse();
        response.setMock(true);

        TopicNode t1 = new TopicNode(
                "Chapter 1: Introduction to Mechanics",
                List.of("1.1 Motion in a Straight Line", "1.2 Vectors", "1.3 Newton's Laws")
        );
        TopicNode t2 = new TopicNode(
                "Chapter 2: Energy and Work",
                List.of("2.1 Kinetic Energy", "2.2 Potential Energy", "2.3 Conservation of Energy")
        );

        QuestionItem q1 = new QuestionItem(
                "Explain Newton's Second Law of Motion with a real-world example.",
                "LONG",
                "medium",
                5
        );
        q1.setExplanation("Newton's second law states that Force = mass x acceleration.");

        QuestionItem q2 = new QuestionItem(
                "Which of the following is a scalar quantity?",
                "MCQ",
                "easy",
                1
        );
        q2.setOptions(List.of("Velocity", "Acceleration", "Speed", "Force"));
        q2.setCorrectAnswer("Speed");
        q2.setExplanation("Speed has magnitude but no direction.");

        response.setTopics(List.of(t1, t2));
        response.setQuestions(List.of(q1, q2));
        return response;
    }

    public GeneratePaperResponse mockGeneratedPaper(GeneratePaperRequest request) {
        List<QuestionItem> mockQuestions = List.of(
                question("Define the term 'Inertia' and explain its types.", "LONG", "medium", 5, null, null),
                question("A car travels 100km in 2 hours. Calculate its average speed.", "SHORT", "easy", 2, null, null),
                question("What is the SI unit of Force?", "MCQ", "easy", 1,
                        List.of("Joule", "Watt", "Newton", "Pascal"), "Newton"),
                question("State the Law of Conservation of Energy.", "SHORT", "medium", 3, null, null),
                question("Calculate the work done when a force of 10N moves an object 5m.", "SHORT", "medium", 3, null, null)
        );

        int setCount = request.getSets() == null || request.getSets() < 1 ? 1 : request.getSets();
        List<QuestionSet> sets = new java.util.ArrayList<>();
        for (int i = 0; i < setCount; i++) {
            String setName = "Set " + (char) ('A' + i);
            sets.add(new QuestionSet(setName, mockQuestions));
        }
        return new GeneratePaperResponse(sets);
    }

    private QuestionItem question(String text, String type, String difficulty, Integer marks, List<String> options, String correct) {
        QuestionItem item = new QuestionItem(text, type, difficulty, marks);
        if (options != null) {
            item.setOptions(options);
        }
        if (correct != null) {
            item.setCorrectAnswer(correct);
        }
        return item;
    }
}
