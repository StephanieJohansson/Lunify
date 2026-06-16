package se.stephanie.lifesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LunifyApplication {

	public static void main(String[] args) {
		SpringApplication.run(LunifyApplication.class, args);
	}

}
