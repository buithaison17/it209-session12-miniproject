FROM gradle:9.7.1-alpine as build
WORKDIR /app
COPY build.gradle settings.gradle gradlew ./
COPY gradle/ ./gradle
COPY src ./src
RUN chmod +x gradlew
RUN ./gradlew clean bootJar --no-daemon

FROM openjdk:17-ea-jdk-alpine as run
WORKDIR /app
COPY --from=build /app/build/libs/*.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8080