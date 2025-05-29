package com.financetracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class GoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllGoals() throws Exception {
        mockMvc.perform(get("/api/goals"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testGetGoalByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/goals/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateGoalBadRequest() throws Exception {
        String invalidGoalJson = "{}"; // Empty JSON, missing required fields
        mockMvc.perform(post("/api/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidGoalJson))
                .andExpect(status().isBadRequest());
    }

    // Additional tests for update, delete, edge cases can be added here
}
