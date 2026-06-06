package com.voltaomundo.open;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import com.voltaomundo.open.exception.BusinessRuleViolationException;
import com.voltaomundo.open.exception.ResourceNotFoundException;
import com.voltaomundo.open.exception.StateConflictException;
import com.voltaomundo.open.web.RestExceptionHandler;

class RestExceptionHandlerTests {

    private final RestExceptionHandler handler = new RestExceptionHandler();

    @Test
    void deveMapearResourceNotFoundPara404() {
        ProblemDetail detail = handler.handleNotFound(new ResourceNotFoundException("Nao encontrado"));

        assertThat(detail.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(detail.getTitle()).isEqualTo("Recurso nao encontrado");
    }

    @Test
    void deveMapearBusinessRulePara400() {
        ProblemDetail detail = handler.handleBusinessRule(new BusinessRuleViolationException("Invalido"));

        assertThat(detail.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(detail.getTitle()).isEqualTo("Regra de negocio invalida");
    }

    @Test
    void deveMapearStateConflictPara409() {
        ProblemDetail detail = handler.handleConflict(new StateConflictException("Conflito"));

        assertThat(detail.getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(detail.getTitle()).isEqualTo("Conflito de estado");
    }
}
