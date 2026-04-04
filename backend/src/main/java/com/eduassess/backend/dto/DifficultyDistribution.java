package com.eduassess.backend.dto;

public class DifficultyDistribution {

    private Integer easy = 30;
    private Integer medium = 50;
    private Integer hard = 20;

    public Integer getEasy() {
        return easy;
    }

    public void setEasy(Integer easy) {
        this.easy = easy;
    }

    public Integer getMedium() {
        return medium;
    }

    public void setMedium(Integer medium) {
        this.medium = medium;
    }

    public Integer getHard() {
        return hard;
    }

    public void setHard(Integer hard) {
        this.hard = hard;
    }
}
