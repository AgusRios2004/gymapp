package com.aplicacionGym.gymapp.dto.response;

public class WebApiResponseBuilder {

    public static WebApiResponse success(String message, Object data) {
        return new WebApiResponse(true, message, data);
    }

    public static WebApiResponse failure(String message) {
        return new WebApiResponse(false, message, null);
    }

    public static WebApiResponse failure(String message, Object data) {
        return new WebApiResponse(false, message, data);
    }
}
