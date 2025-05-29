package com.financetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.model.Goal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class GoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllGoals() throws Exception {
        mockMvc.perform(get("/api/goals"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
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

    @Test
    public void testCreateGoalSuccess() throws Exception {
        Goal goal = new Goal();
        goal.setName("Test Goal");
        goal.setTargetAmount(new BigDecimal("1000.00"));
        goal.setUserId(1L);

        mockMvc.perform(post("/api/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(goal)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Test Goal")))
                .andExpect(jsonPath("$.targetAmount", is(1000.00)))
                .andExpect(jsonPath("$.userId", is(1)));
    }

    @Test
    public void testUpdateGoalNotFound() throws Exception {
        Goal goal = new Goal();
        goal.setName("Updated Goal");

        mockMvc.perform(put("/api/goals/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(goal)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteGoalNotFound() throws Exception {
        mockMvc.perform(delete("/api/goals/9999"))
                .andExpect(status().isNotFound());
    }

    // Additional edge case tests can be added here
}
