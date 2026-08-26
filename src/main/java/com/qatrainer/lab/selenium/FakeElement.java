package com.qatrainer.lab.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;

public class FakeElement implements WebElement {

    private final FakeDriver driver;
    private final String key;
    private final FakeDriver.Node node;

    public FakeElement(FakeDriver driver, String key, FakeDriver.Node node) {
        this.driver = driver;
        this.key = key;
        this.node = node;
    }

    public FakeDriver.Node getNode() {
        return node;
    }

    @Override
    public void click() {
        driver.log("click:" + key);
    }

    @Override
    public void submit() {
        driver.log("submit:" + key);
    }

    @Override
    public void sendKeys(CharSequence... keysToSend) {
        StringBuilder sb = new StringBuilder();
        for (CharSequence cs : keysToSend) {
            sb.append(cs);
        }
        node.value = (node.value == null ? "" : node.value) + sb;
        driver.log("sendKeys:" + key + ":" + sb);
    }

    @Override
    public void clear() {
        node.value = "";
        driver.log("clear:" + key);
    }

    @Override
    public String getTagName() {
        return node.tag;
    }

    @Override
    public String getAttribute(String name) {
        if ("id".equals(name)) return node.id;
        if ("name".equals(name)) return node.name;
        if ("class".equals(name)) return node.cssClass;
        if ("value".equals(name)) return node.value;
        if ("data-testid".equals(name)) return node.testId;
        return node.attrs.get(name);
    }

    @Override
    public boolean isSelected() {
        return node.selected;
    }

    @Override
    public boolean isEnabled() {
        return node.enabled;
    }

    @Override
    public String getText() {
        return node.text;
    }

    @Override
    public List<WebElement> findElements(By by) {
        return driver.findElements(by);
    }

    @Override
    public WebElement findElement(By by) {
        return driver.findElement(by);
    }

    @Override
    public boolean isDisplayed() {
        return node.displayed;
    }

    @Override
    public Point getLocation() {
        return new Point(0, 0);
    }

    @Override
    public Dimension getSize() {
        return new Dimension(10, 10);
    }

    @Override
    public Rectangle getRect() {
        return new Rectangle(0, 0, 10, 10);
    }

    @Override
    public String getCssValue(String propertyName) {
        return "";
    }

    @Override
    public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
        throw new WebDriverException("screenshots not supported in FakeDriver");
    }
}
