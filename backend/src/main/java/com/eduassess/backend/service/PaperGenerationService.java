package com.eduassess.backend.service;

import com.eduassess.backend.dto.GeneratePaperRequest;
import com.eduassess.backend.dto.GeneratePaperResponse;
import com.eduassess.backend.repository.MockQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class PaperGenerationService {

    private final GeminiClientService geminiClientService;
    private final MockQuestionRepository mockQuestionRepository;

    public PaperGenerationService(GeminiClientService geminiClientService, MockQuestionRepository mockQuestionRepository) {
        this.geminiClientService = geminiClientService;
        this.mockQuestionRepository = mockQuestionRepository;
    }

    public GeneratePaperResponse generatePaper(GeneratePaperRequest request) {
        if (geminiClientService.isMockMode()) {
            return mockQuestionRepository.mockGeneratedPaper(request);
        }

        String topics = request.getTopics() == null || request.getTopics().isEmpty()
                ? "general coverage"
                : request.getTopics().stream().collect(Collectors.joining(", "));

        String questionTypes = request.getQuestionTypes() == null || request.getQuestionTypes().isEmpty()
                ? "MCQ, SHORT, LONG"
                : request.getQuestionTypes().stream().collect(Collectors.joining(", "));

        String prompt = """
                You are an educational expert. Generate %d distinct question paper set(s) based on these parameters:
                Subject: %s
                Class: %s
                Topics: %s
                Difficulty Distribution: easy=%d, medium=%d, hard=%d
                Total Marks: %d
                Duration (minutes): %d
                Question Types: %s
                Format: %s

                CORE INSTRUCTIONS:
                1. Do NOT copy or reuse questions verbatim from any source.
                2. All questions must be conceptually relevant, novel, unseen, and academically appropriate.
                3. Ensure clarity and grammatical correctness.

                MULTIPLE SETS INSTRUCTIONS (if sets > 1):
                - Generate %d distinct and independent question papers.
                - Each set must be different from the others but maintain the same difficulty level and structure.
                - Ensure NO overlapping or repeated questions between different sets.

                Return STRICT JSON in this schema:
                {
                  "sets": [
                    {
                      "setName": "Set A",
                      "questions": [
                        {
                          "text": "Original question text...",
                          "type": "MCQ",
                          "difficulty": "medium",
                          "marks": 5,
                          "options": ["A", "B", "C", "D"],
                          "correctAnswer": "A"
                        }
                      ]
                    }
                  ]
                }
                """.formatted(
                safeInt(request.getSets(), 1),
                safeText(request.getSubject(), "General"),
                safeText(request.getClassName(), "General"),
                topics,
                safeInt(request.getDifficulty() != null ? request.getDifficulty().getEasy() : null, 30),
                safeInt(request.getDifficulty() != null ? request.getDifficulty().getMedium() : null, 50),
                safeInt(request.getDifficulty() != null ? request.getDifficulty().getHard() : null, 20),
                safeInt(request.getTotalMarks(), 100),
                safeInt(request.getDuration(), 60),
                questionTypes,
                safeText(request.getFormat(), "CBSE"),
                safeInt(request.getSets(), 1)
        );

        return geminiClientService.generateFromText(prompt, GeneratePaperResponse.class);
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int safeInt(Integer value, int fallback) {
        return value == null ? fallback : value;
    }
}
