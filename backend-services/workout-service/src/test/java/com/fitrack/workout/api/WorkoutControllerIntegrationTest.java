package com.fitrack.workout.api;

import com.fitrack.workout.TestContainersImages;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class WorkoutControllerIntegrationTest {

	@Container
	@ServiceConnection
	static MongoDBContainer mongo = new MongoDBContainer(TestContainersImages.MONGO);

	@Container
	@ServiceConnection
	static RabbitMQContainer rabbit = new RabbitMQContainer(TestContainersImages.RABBITMQ);

	@Autowired
	private MockMvc mockMvc;

	@Test
	void createAndListWorkoutsWithDevHeaders() throws Exception {
		mockMvc.perform(post("/workouts")
						.header("X-User-Id", "user-123")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "title": "Leg day",
								  "durationMinutes": 60,
								  "exercises": [
								    {"name": "Squat", "sets": 4, "reps": 8, "weightKg": 80}
								  ]
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Leg day"))
				.andExpect(jsonPath("$.userId").value("user-123"))
				.andExpect(jsonPath("$.exercises[0].name").value("Squat"))
				.andExpect(jsonPath("$.exercises[0].sets").value(4));

		mockMvc.perform(get("/workouts")
						.header("X-User-Id", "user-123"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].exercises[0].name").value("Squat"));
	}

	@Test
	void rejectsMissingUserIdHeader() throws Exception {
		mockMvc.perform(get("/workouts"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.error").exists());
	}
}
