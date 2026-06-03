package com.fitrack.iam.api;

import com.fitrack.iam.TestContainersImages;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthControllerIntegrationTest {

    @Container
    @ServiceConnection
    static MongoDBContainer mongo = new MongoDBContainer(TestContainersImages.MONGO);

    @Container
    @ServiceConnection
    static RabbitMQContainer rabbit = new RabbitMQContainer(TestContainersImages.RABBITMQ);

    @Autowired
    MockMvc mockMvc;

    @Test
    void registerLoginAndMe() throws Exception {
        String email = "integration-" + System.currentTimeMillis() + "@fitrack.test";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "secret123",
                                  "fullName": "Integration User",
                                  "phoneNumber": "+1234567890",
                                  "gender": "other"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());

        MvcResult login = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "password": "secret123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        String body = login.getResponse().getContentAsString();
        String token = body.replaceAll("(?s).*\"accessToken\"\\s*:\\s*\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value("Integration User"));
    }

    @Test
    void forwardAuth_returnsInternalUserHeaders() throws Exception {
        String email = "forward-" + System.currentTimeMillis() + "@fitrack.test";

        MvcResult register = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "secret123",
                                  "fullName": "Forward User",
                                  "phoneNumber": "+1",
                                  "gender": "other"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        String token = register.getResponse().getContentAsString()
                .replaceAll("(?s).*\"accessToken\"\\s*:\\s*\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/auth/forward-auth").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Internal-User-Id"))
                .andExpect(header().string("X-Internal-User-Email", email));
    }
}
