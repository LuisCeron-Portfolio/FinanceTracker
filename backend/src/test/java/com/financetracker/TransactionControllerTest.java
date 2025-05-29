package com.financetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.model.Transaction;
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
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    @Test
    public void testCreateTransactionSuccess() throws Exception {
        Transaction transaction = new Transaction();
        transaction.setAmount(new BigDecimal("100.00"));
        transaction.setDescription("Test transaction");
        transaction.setCategory("Test category");
        transaction.setUserId(1L);

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount", is(100.00)))
                .andExpect(jsonPath("$.description", is("Test transaction")))
                .andExpect(jsonPath("$.category", is("Test category")))
                .andExpect(jsonPath("$.userId", is(1)));
    }

    @Test
    public void testUpdateTransactionNotFound() throws Exception {
        Transaction transaction = new Transaction();
        transaction.setAmount(new BigDecimal("200.00"));

        mockMvc.perform(put("/api/transactions/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transaction)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteTransactionNotFound() throws Exception {
        mockMvc.perform(delete("/api/transactions/9999"))
                .andExpect(status().isNotFound());
    }

    // Additional edge case tests can be added here
}
