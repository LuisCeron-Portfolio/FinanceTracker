package com.financetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.model.BankSync;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
public class BankSyncControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllBankSyncs() throws Exception {
        mockMvc.perform(get("/api/banksync"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetBankSyncByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/banksync/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateBankSyncBadRequest() throws Exception {
        String invalidBankSyncJson = "{}"; // Empty JSON, missing required fields
        mockMvc.perform(post("/api/banksync")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidBankSyncJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCreateBankSyncSuccess() throws Exception {
        BankSync bankSync = new BankSync();
        bankSync.setBankName("Test Bank");
        bankSync.setUserId(1L);

        mockMvc.perform(post("/api/banksync")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bankSync)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bankName", is("Test Bank")))
                .andExpect(jsonPath("$.userId", is(1)));
    }

    @Test
    public void testUpdateBankSyncNotFound() throws Exception {
        BankSync bankSync = new BankSync();
        bankSync.setBankName("Updated Bank");

        mockMvc.perform(put("/api/banksync/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bankSync)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteBankSyncNotFound() throws Exception {
        mockMvc.perform(delete("/api/banksync/9999"))
                .andExpect(status().isNotFound());
    }

    // Additional edge case tests can be added here
}
