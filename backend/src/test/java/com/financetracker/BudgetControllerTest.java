package com.financetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.model.Budget;
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
public class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    @Test
    public void testCreateBudgetSuccess() throws Exception {
        Budget budget = new Budget();
        budget.setAmount(new BigDecimal("500.00"));
        budget.setCategory("Test category");
        budget.setUserId(1L);

        mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(budget)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount", is(500.00)))
                .andExpect(jsonPath("$.category", is("Test category")))
                .andExpect(jsonPath("$.userId", is(1)));
    }

    @Test
    public void testUpdateBudgetNotFound() throws Exception {
        Budget budget = new Budget();
        budget.setAmount(new BigDecimal("600.00"));

        mockMvc.perform(put("/api/budgets/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(budget)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteBudgetNotFound() throws Exception {
        mockMvc.perform(delete("/api/budgets/9999"))
                .andExpect(status().isNotFound());
    }

    // Additional edge case tests can be added here
}
