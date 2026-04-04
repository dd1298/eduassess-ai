package com.eduassess.backend.dto;

public class HealthResponse {

    private String status;
    private String env;

    public HealthResponse() {
    }

    public HealthResponse(String status, String env) {
        this.status = status;
        this.env = env;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEnv() {
        return env;
    }

    public void setEnv(String env) {
        this.env = env;
    }
}
