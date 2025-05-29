package com.financetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.model.Alert;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllAlerts() throws Exception {
        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
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

    @Test
    public void testCreateAlertSuccess() throws Exception {
        Alert alert = new Alert();
        alert.setMessage("Test alert");
        alert.setUserId(1L);

        mockMvc.perform(post("/api/alerts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alert)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Test alert")))
                .andExpect(jsonPath("$.userId", is(1)));
    }

    @Test
    public void testUpdateAlertNotFound() throws Exception {
        Alert alert = new Alert();
        alert.setMessage("Updated alert");

        mockMvc.perform(put("/api/alerts/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alert)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteAlertNotFound() throws Exception {
        mockMvc.perform(delete("/api/alerts/9999"))
                .andExpect(status().isNotFound());
    }

    // Additional edge case tests can be added here
}
