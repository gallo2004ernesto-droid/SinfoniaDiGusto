# Stage 1: Compilazione con Maven e OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache delle dipendenze Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia sorgenti e build del pacchetto JAR
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime leggero Alpine con Java 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia del JAR compilato dallo stage precedente
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]