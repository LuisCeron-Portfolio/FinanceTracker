package com.financetracker;

import com.financetracker.model.Transaction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllTransactions() throws Exception {
        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    public void testGetTransactionByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/transactions/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateTransactionBadRequest() throws Exception {
        String invalidTransactionJson = "{}"; // Empty JSON, missing required fields
        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidTransactionJson))
                .andExpect(status().isBadRequest());
    }

    // Additional tests for update, delete, edge cases can be added here
}
