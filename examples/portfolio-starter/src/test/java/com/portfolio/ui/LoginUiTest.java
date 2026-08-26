package com.portfolio.ui;

import com.portfolio.core.DriverFactory;
import com.portfolio.core.TestConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;

import static org.assertj.core.api.Assertions.assertThat;

class LoginUiTest {
    private WebDriver driver;

    @BeforeEach
    void setUp() {
        Assumptions.assumeFalse(TestConfig.skipUi(), "UI skipped via -DskipUi=true");
        driver = DriverFactory.chrome();
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void validLogin() {
        String flash = new LoginPage(driver)
                .open(TestConfig.uiBase())
                .loginAs("tomsmith", "SuperSecretPassword!");
        assertThat(flash).containsIgnoringCase("You logged into a secure area");
    }

    @Test
    void invalidLogin() {
        String flash = new LoginPage(driver)
                .open(TestConfig.uiBase())
                .loginAs("tomsmith", "wrong");
        assertThat(flash).containsIgnoringCase("Your password is invalid");
    }
}
