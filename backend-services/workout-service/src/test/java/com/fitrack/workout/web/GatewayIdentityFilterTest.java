package com.fitrack.workout.web;

import com.fitrack.workout.TestContainersImages;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("gateway")
class GatewayIdentityFilterTest {

	@Container
	@ServiceConnection
	static MongoDBContainer mongo = new MongoDBContainer(TestContainersImages.MONGO);

	@Autowired
	private MockMvc mockMvc;

	@Test
	void acceptsGatewayInjectedIdentity() throws Exception {
		mockMvc.perform(post("/workouts")
						.header("X-Gateway-Trusted", "fitrack-dev-gateway")
						.header("X-Internal-User-Id", "user-456")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\"Run\",\"exercises\":[]}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.userId").value("user-456"));
	}

	@Test
	void rejectsClientXUserId() throws Exception {
		mockMvc.perform(post("/workouts")
						.header("X-Gateway-Trusted", "fitrack-dev-gateway")
						.header("X-User-Id", "attacker")
						.header("X-Internal-User-Id", "user-456")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\"Run\",\"exercises\":[]}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error").value("Do not send X-User-Id; use Authorization: Bearer via the gateway"));
	}

	@Test
	void rejectsMissingGatewayTrust() throws Exception {
		mockMvc.perform(post("/workouts")
						.header("X-Internal-User-Id", "user-456")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\"Run\",\"exercises\":[]}"))
				.andExpect(status().isUnauthorized());
	}
}
