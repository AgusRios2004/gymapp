package com.aplicacionGym.gymapp.modules.core.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final Cache<String, Integer> attemptsCache = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build();

    private static final int MAX_ATTEMPTS = 5;

    public boolean isBlocked(String ip) {
        Integer attempts = attemptsCache.getIfPresent(ip);
        return attempts != null && attempts >= MAX_ATTEMPTS;
    }

    public void registerAttempt(String ip) {
        Integer attempts = attemptsCache.getIfPresent(ip);
        if (attempts == null) {
            attempts = 0;
        }
        attemptsCache.put(ip, attempts + 1);
    }

    public void resetAttempts(String ip) {
        attemptsCache.invalidate(ip);
    }
}
