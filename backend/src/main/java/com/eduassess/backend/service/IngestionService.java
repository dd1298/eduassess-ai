package com.eduassess.backend.service;

import com.eduassess.backend.dto.IngestPdfResponse;
import com.eduassess.backend.repository.MockQuestionRepository;
import org.springframework.stereotype.Service;

@Service
public class IngestionService {

    private final GeminiClientService geminiClientService;
    private final MockQuestionRepository mockQuestionRepository;

    public IngestionService(GeminiClientService geminiClientService, MockQuestionRepository mockQuestionRepository) {
        this.geminiClientService = geminiClientService;
        this.mockQuestionRepository = mockQuestionRepository;
    }

    public IngestPdfResponse ingestPdf(byte[] pdfBytes, String subjectId, String className) {
        if (geminiClientService.isMockMode()) {
            return mockQuestionRepository.mockIngestionResult();
        }

        String prompt = """
                You are an educational expert. I am uploading a textbook or question paper.

                CORE INSTRUCTIONS:
                1. Do NOT copy or reuse questions verbatim from the PDF.
                2. Never replicate, paraphrase too closely, or slightly modify existing questions.
                3. Avoid direct extraction from the source.

                LEARN FROM THE PDF INSTEAD:
                - Understand topic distribution.
                - Identify difficulty levels (easy, medium, hard).
                - Recognize question types (MCQ, short answer, long answer, case-based, etc.).
                - Grasp concept coverage.

                Context:
                - Subject ID: %s
                - Class Name: %s

                Use this understanding to extract a hierarchical topic tree and a set of 10 sample questions.
                Ensure all questions are conceptually relevant, novel, unseen, and aligned with the same academic level and depth as the source.

                Return STRICT JSON matching this schema:
                {
                  "isMock": false,
                  "topics": [{"name": "Chapter 1: Intro", "subtopics": ["1.1 History", "1.2 Basics"]}],
                  "questions": [
                    {
                      "text": "A completely original question based on the concepts...",
                      "type": "MCQ",
                      "difficulty": "easy",
                      "marks": 1,
                      "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
                      "correctAnswer": "Opt A",
                      "explanation": "Detailed explanation..."
                    }
                  ]
                }
                """.formatted(safe(subjectId), safe(className));

        IngestPdfResponse response = geminiClientService.generateFromPdf(prompt, pdfBytes, IngestPdfResponse.class);
        response.setMock(false);
        return response;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "general" : value;
    }
}
