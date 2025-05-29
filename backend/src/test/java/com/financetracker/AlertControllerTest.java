package com.financetracker;

import com.financetracker.controller.AlertController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllAlerts() throws Exception {
        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetAlertByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/alerts/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateAlertBadRequest() throws Exception {
        String invalidAlertJson = "{}"; // Empty JSON, missing required fields
        mockMvc.perform(post("/api/alerts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidAlertJson))
                .andExpect(status().isBadRequest());
    }

    // Additional tests for update, delete, edge cases can be added here
}
