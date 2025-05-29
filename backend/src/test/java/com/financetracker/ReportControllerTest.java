package com.financetracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllReports() throws Exception {
        mockMvc.perform(get("/api/reports"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetReportByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/reports/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateReportBadRequest() throws Exception {
        String invalidReportJson = "{}"; // Empty JSON, missing required fields
        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidReportJson))
                .andExpect(status().isBadRequest());
    }

    // Additional tests for update, delete, edge cases can be added here
}
