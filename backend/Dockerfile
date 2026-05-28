# Usamos una imagen base de OpenJDK
FROM eclipse-temurin:25-jdk-ubi10-minimal

# Directorio dentro del contenedor
WORKDIR /app

# Copiamos el JAR al contenedor
COPY target/*.jar app.jar

# Puerto en el que correrá Spring Boot
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]