package com.tien.project_be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ProjectBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectBeApplication.class, args);
    }

}
