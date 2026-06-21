package com.fitrack.workout;

import com.fitrack.workout.TestContainersImages;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class WorkoutApplicationTests {

	@Container
	@ServiceConnection
	static MongoDBContainer mongo = new MongoDBContainer(TestContainersImages.MONGO);

	@Container
	@ServiceConnection
	static RabbitMQContainer rabbit = new RabbitMQContainer(TestContainersImages.RABBITMQ);

	@Test
	void contextLoads() {
	}

}
