package com.financetracker;

import com.financetracker.controller.BankSyncController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class BankSyncControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testSyncBankData() throws Exception {
        mockMvc.perform(post("/api/bank-sync"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void testSyncBankDataUnauthorized() throws Exception {
        mockMvc.perform(post("/api/bank-sync"))
                .andExpect(status().is4xxClientError());
    }

    // Additional tests for error cases and edge cases can be added here
}
