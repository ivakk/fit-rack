package com.fitrack.iam.api;

import com.fitrack.iam.api.error.GlobalExceptionHandler;
import com.fitrack.iam.application.port.in.AuthUseCase;
import com.fitrack.iam.application.port.out.TokenProvider;
import com.fitrack.iam.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class AuthControllerErrorIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    AuthUseCase auth;

    @MockitoBean
    TokenProvider tokens;

    @Test
    void unexpectedFailureReturnsGenericError() throws Exception {
        when(auth.login(any())).thenThrow(new RuntimeException("database unavailable"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "user@fitrack.test", "password": "secret123"}
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("An unexpected error occurred"));
    }
}
