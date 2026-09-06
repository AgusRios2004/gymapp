package com.aplicacionGym.gymapp.modules.core.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.util.function.Supplier;

@Component
public class TransactionRunner {

    private final PlatformTransactionManager transactionManager;

    public TransactionRunner(PlatformTransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    public <T> T call(Supplier<T> action) {
        TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
        try {
            T result = action.get();
            transactionManager.commit(status);
            return result;
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }
    }

    public void run(Runnable action) {
        call(() -> {
            action.run();
            return null;
        });
    }
}
