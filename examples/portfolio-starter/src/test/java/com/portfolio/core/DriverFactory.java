package com.portfolio.core;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public final class DriverFactory {
    private DriverFactory() {}

    public static WebDriver chrome() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        if (Boolean.parseBoolean(System.getProperty("headless", "true"))) {
            options.addArguments("--headless=new", "--window-size=1280,900");
        }
        options.addArguments("--disable-gpu", "--no-sandbox");
        return new ChromeDriver(options);
    }
}
