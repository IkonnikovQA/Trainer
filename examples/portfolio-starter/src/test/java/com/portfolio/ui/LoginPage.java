package com.portfolio.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;
    private final By username = By.id("username");
    private final By password = By.id("password");
    private final By submit = By.cssSelector("button[type='submit']");
    private final By flash = By.id("flash");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public LoginPage open(String base) {
        driver.get(base + "/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(username));
        return this;
    }

    public String loginAs(String user, String pass) {
        driver.findElement(username).clear();
        driver.findElement(username).sendKeys(user);
        driver.findElement(password).clear();
        driver.findElement(password).sendKeys(pass);
        driver.findElement(submit).click();
        return wait.until(ExpectedConditions.visibilityOfElementLocated(flash)).getText();
    }
}
