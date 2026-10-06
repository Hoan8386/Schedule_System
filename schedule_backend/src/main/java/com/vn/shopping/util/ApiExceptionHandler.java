package com.vn.shopping.util;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ErrorResponse> handleApiException(ApiException exception) {
        return ResponseEntity.status(exception.status())
                .body(new ErrorResponse(Instant.now(), exception.status().value(), exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleUnexpectedException(Exception exception) {
        return ResponseEntity.internalServerError()
                .body(new ErrorResponse(Instant.now(), 500, "ÄÃ£ xáº£y ra lá»—i khi xá»­ lÃ½ yÃªu cáº§u"));
    }

    record ErrorResponse(Instant timestamp, int status, String message) {
    }
}


