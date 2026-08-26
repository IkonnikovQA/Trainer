package com.qatrainer.lab.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FakeDriverTest {

    @Test
    void findsByIdAndCssAndTestId() {
        FakeDriver driver = FakeDriver.fromFixtureJson("""
                {"elements":[
                  {"tag":"button","id":"go","testId":"login","text":"Login","class":"btn primary"}
                ]}
                """);
        assertThat(driver.findElement(By.id("go")).getText()).isEqualTo("Login");
        assertThat(driver.findElement(By.cssSelector("[data-testid='login']")).getText()).isEqualTo("Login");
        assertThat(driver.findElement(By.className("primary")).getText()).isEqualTo("Login");
    }

    @Test
    void findsByXpathButtonText() {
        FakeDriver driver = FakeDriver.fromFixtureJson("""
                {"elements":[{"tag":"button","id":"s","text":"Save"}]}
                """);
        assertThat(driver.findElement(By.xpath("//button[normalize-space()='Save']")).getText()).isEqualTo("Save");
    }

    @Test
    void frameAndDefaultContent() {
        FakeDriver driver = FakeDriver.fromFixtureJson("""
                {"elements":[
                  {"tag":"iframe","id":"pay"},
                  {"tag":"span","id":"amount","text":"100","frameId":"pay"}
                ]}
                """);
        assertThatThrownBy(() -> driver.findElement(By.id("amount")))
                .isInstanceOf(NoSuchElementException.class);
        driver.switchTo().frame("pay");
        assertThat(driver.findElement(By.id("amount")).getText()).isEqualTo("100");
        driver.switchTo().defaultContent();
        assertThat(driver.getActionsLog()).contains("defaultContent");
    }

    @Test
    void appearAfterMsHidesThenShows() throws Exception {
        FakeDriver driver = FakeDriver.fromFixtureJson("""
                {"elements":[{"tag":"div","id":"ready","text":"Ready","appearAfterMs":200}]}
                """);
        assertThatThrownBy(() -> driver.findElement(By.id("ready")))
                .isInstanceOf(NoSuchElementException.class);
        Thread.sleep(250);
        WebElement el = driver.findElement(By.id("ready"));
        assertThat(el.getText()).isEqualTo("Ready");
    }

    @Test
    void quitEndsSession() {
        FakeDriver driver = new FakeDriver();
        driver.get("https://example.com");
        driver.quit();
        assertThat(driver.isQuit()).isTrue();
        assertThat(driver.getActionsLog()).contains("quit");
    }
}
