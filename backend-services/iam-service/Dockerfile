FROM gradle:8.14.3-jdk21 AS build
WORKDIR /home/gradle/project
COPY . .
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /home/gradle/project/build/libs/*.jar app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=12 --start-period=40s \
  CMD curl -fsS http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
