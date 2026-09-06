package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.modules.core.service.TransactionRunner;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
class TransactionRunnerTest {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    void shouldRollbackOnFailure() {
        TransactionRunner runner = new TransactionRunner(transactionManager);
        
        assertThrows(RuntimeException.class, () -> {
            runner.run(() -> {
                // Logic that should fail
                throw new RuntimeException("Rollback me");
            });
        });
    }

    @Test
    void shouldCommitOnSuccess() {
        TransactionRunner runner = new TransactionRunner(transactionManager);
        
        String result = runner.call(() -> "Success");
        assertEquals("Success", result);
    }
}
