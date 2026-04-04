package com.eduassess.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "eduassess.gemini")
public class GeminiProperties {

    private String model = "gemini-2.5-pro";

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
