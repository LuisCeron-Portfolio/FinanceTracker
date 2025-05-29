package com.financetracker;

import com.financetracker.controller.BudgetController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllBudgets() throws Exception {
        mockMvc.perform(get("/api/budgets"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetBudgetByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/budgets/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateBudgetBadRequest() throws Exception {
        String invalidBudgetJson = "{}"; // Empty JSON, missing required fields
        mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidBudgetJson))
                .andExpect(status().isBadRequest());
    }

    // Additional tests for update, delete, edge cases can be added here
}
