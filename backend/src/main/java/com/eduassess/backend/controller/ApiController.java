package com.eduassess.backend.controller;

import com.eduassess.backend.dto.GeneratePaperRequest;
import com.eduassess.backend.dto.GeneratePaperResponse;
import com.eduassess.backend.dto.HealthResponse;
import com.eduassess.backend.dto.IngestPdfResponse;
import com.eduassess.backend.service.IngestionService;
import com.eduassess.backend.service.PaperGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final IngestionService ingestionService;
    private final PaperGenerationService paperGenerationService;

    public ApiController(IngestionService ingestionService, PaperGenerationService paperGenerationService) {
        this.ingestionService = ingestionService;
        this.paperGenerationService = paperGenerationService;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        String env = System.getenv().getOrDefault("SPRING_PROFILES_ACTIVE", "default");
        return new HealthResponse("ok", env);
    }

    @PostMapping(value = "/ingest-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IngestPdfResponse ingestPdf(
            @RequestPart("pdf") MultipartFile pdf,
            @RequestParam(value = "subjectId", required = false) String subjectId,
            @RequestParam(value = "className", required = false) String className
    ) throws IOException {
        if (pdf.isEmpty()) {
            throw new IllegalArgumentException("No PDF file uploaded");
        }
        return ingestionService.ingestPdf(pdf.getBytes(), subjectId, className);
    }

    @PostMapping("/generate-paper")
    public GeneratePaperResponse generatePaper(@Valid @RequestBody GeneratePaperRequest request) {
        return paperGenerationService.generatePaper(request);
    }
}
