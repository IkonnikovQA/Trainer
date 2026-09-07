package com.qatrainer.lab.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * In-memory WebDriver for trainer labs. DOM is a flat map of elements with attributes.
 */
public class FakeDriver implements WebDriver {

    public static class Node {
        public String tag = "div";
        public String id;
        public String name;
        public String cssClass;
        public String text = "";
        public String value = "";
        public String testId;
        public boolean displayed = true;
        public boolean enabled = true;
        public boolean selected = false;
        public Map<String, String> attrs = new HashMap<>();
        public String frameId;
        /** millis after which element becomes findable (for wait labs) */
        public long appearAfterMs = 0;
        public long createdAt = System.currentTimeMillis();
    }

    private final Map<String, Node> nodes = new LinkedHashMap<>();
    private final List<String> windowHandles = new ArrayList<>();
    private String currentHandle;
    private String currentUrl = "about:blank";
    private String title = "";
    private boolean quit;
    private String activeFrame = null;
    private final Map<String, String> windowTitles = new HashMap<>();
    private final List<String> alertQueue = new ArrayList<>();
    private final List<String> actionsLog = new ArrayList<>();

    public FakeDriver() {
        currentHandle = UUID.randomUUID().toString();
        windowHandles.add(currentHandle);
        windowTitles.put(currentHandle, title);
    }

    public static FakeDriver fromFixtureJson(String json) {
        FakeDriver driver = new FakeDriver();
        if (json == null || json.isBlank()) {
            return driver;
        }
        // Minimal JSON parser via simple conventions — use Jackson if available
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
            if (root.has("title")) {
                driver.title = root.get("title").asText();
                driver.windowTitles.put(driver.currentHandle, driver.title);
            }
            if (root.has("url")) {
                driver.currentUrl = root.get("url").asText();
            }
            if (root.has("elements") && root.get("elements").isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode el : root.get("elements")) {
                    Node n = new Node();
                    n.tag = text(el, "tag", "div");
                    n.id = text(el, "id", null);
                    n.name = text(el, "name", null);
                    n.cssClass = text(el, "class", null);
                    n.text = text(el, "text", "");
                    n.value = text(el, "value", "");
                    n.testId = text(el, "testId", null);
                    n.displayed = el.has("displayed") ? el.get("displayed").asBoolean() : true;
                    n.enabled = el.has("enabled") ? el.get("enabled").asBoolean() : true;
                    n.frameId = text(el, "frameId", null);
                    n.appearAfterMs = el.has("appearAfterMs") ? el.get("appearAfterMs").asLong() : 0L;
                    if (el.has("attrs") && el.get("attrs").isObject()) {
                        el.get("attrs").fields().forEachRemaining(e -> n.attrs.put(e.getKey(), e.getValue().asText()));
                    }
                    String key = n.id != null ? n.id : UUID.randomUUID().toString();
                    driver.nodes.put(key, n);
                }
            }
            if (root.has("windows") && root.get("windows").isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode w : root.get("windows")) {
                    String h = text(w, "handle", UUID.randomUUID().toString());
                    if (!driver.windowHandles.contains(h)) {
                        driver.windowHandles.add(h);
                    }
                    driver.windowTitles.put(h, text(w, "title", ""));
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Bad fixtureJson: " + e.getMessage(), e);
        }
        return driver;
    }

    private static String text(com.fasterxml.jackson.databind.JsonNode n, String field, String def) {
        return n.has(field) && !n.get(field).isNull() ? n.get(field).asText() : def;
    }

    public void addNode(String key, Node node) {
        nodes.put(key, node);
    }

    public List<String> getActionsLog() {
        return actionsLog;
    }

    public void log(String action) {
        actionsLog.add(action);
    }

    public boolean isQuit() {
        return quit;
    }

    public Map<String, Node> getNodes() {
        return nodes;
    }

    @Override
    public void get(String url) {
        ensureOpen();
        currentUrl = url;
        log("get:" + url);
    }

    @Override
    public String getCurrentUrl() {
        ensureOpen();
        return currentUrl;
    }

    @Override
    public String getTitle() {
        ensureOpen();
        return windowTitles.getOrDefault(currentHandle, title);
    }

    public void setTitle(String title) {
        this.title = title;
        windowTitles.put(currentHandle, title);
    }

    @Override
    public List<WebElement> findElements(By by) {
        ensureOpen();
        return nodes.entrySet().stream()
                .filter(e -> visibleInContext(e.getValue()))
                .filter(e -> matches(e.getValue(), by))
                .map(e -> (WebElement) new FakeElement(this, e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    @Override
    public WebElement findElement(By by) {
        List<WebElement> found = findElements(by);
        if (found.isEmpty()) {
            throw new NoSuchElementException("Cannot locate " + by);
        }
        return found.get(0);
    }

    private boolean visibleInContext(Node n) {
        if (n.appearAfterMs > 0 && System.currentTimeMillis() - n.createdAt < n.appearAfterMs) {
            return false;
        }
        if (activeFrame == null) {
            return n.frameId == null;
        }
        return Objects.equals(activeFrame, n.frameId);
    }

    private boolean matches(Node n, By by) {
        String s = by.toString();
        if (s.startsWith("By.id: ")) {
            return Objects.equals(n.id, s.substring("By.id: ".length()));
        }
        if (s.startsWith("By.name: ")) {
            return Objects.equals(n.name, s.substring("By.name: ".length()));
        }
        if (s.startsWith("By.className: ")) {
            String cls = s.substring("By.className: ".length());
            return n.cssClass != null && List.of(n.cssClass.split("\\s+")).contains(cls);
        }
        if (s.startsWith("By.tagName: ")) {
            return n.tag != null && n.tag.equalsIgnoreCase(s.substring("By.tagName: ".length()));
        }
        if (s.startsWith("By.cssSelector: ")) {
            return matchCss(n, s.substring("By.cssSelector: ".length()).trim());
        }
        if (s.startsWith("By.xpath: ")) {
            return matchXpath(n, s.substring("By.xpath: ".length()).trim());
        }
        if (s.startsWith("By.linkText: ")) {
            return "a".equalsIgnoreCase(n.tag) && Objects.equals(n.text, s.substring("By.linkText: ".length()));
        }
        if (s.startsWith("By.partialLinkText: ")) {
            String p = s.substring("By.partialLinkText: ".length());
            return "a".equalsIgnoreCase(n.tag) && n.text != null && n.text.contains(p);
        }
        return false;
    }

    private boolean matchCss(Node n, String css) {
        if (css.startsWith("#")) {
            return Objects.equals(n.id, css.substring(1));
        }
        if (css.startsWith(".")) {
            return n.cssClass != null && List.of(n.cssClass.split("\\s+")).contains(css.substring(1));
        }
        if (css.contains("[data-testid=")) {
            String id = css.replaceAll(".*data-testid=['\"]?([^'\"\\]]+)['\"]?].*", "$1");
            return Objects.equals(n.testId, id);
        }
        if (css.contains("[name=")) {
            String name = css.replaceAll(".*name=['\"]?([^'\"\\]]+)['\"]?].*", "$1");
            return Objects.equals(n.name, name);
        }
        if (css.matches("[a-zA-Z0-9]+")) {
            return n.tag != null && n.tag.equalsIgnoreCase(css);
        }
        // tag.class
        if (css.contains(".")) {
            String[] parts = css.split("\\.", 2);
            return n.tag != null && n.tag.equalsIgnoreCase(parts[0])
                    && n.cssClass != null
                    && List.of(n.cssClass.split("\\s+")).contains(parts[1]);
        }
        return false;
    }

    private boolean matchXpath(Node n, String xp) {
        // //button[normalize-space()='Save']
        if (xp.matches("//\\w+\\[normalize-space\\(\\)='[^']+'\\]")) {
            String tag = xp.replaceAll("//(\\w+)\\[.*", "$1");
            String text = xp.replaceAll(".*normalize-space\\(\\)='([^']+)'\\].*", "$1");
            return tag.equalsIgnoreCase(n.tag) && Objects.equals(text, n.text == null ? null : n.text.trim());
        }
        if (xp.matches("//\\*\\[@id='[^']+'\\]") || xp.matches("//\\w+\\[@id='[^']+'\\]")) {
            String id = xp.replaceAll(".*@id='([^']+)'.*", "$1");
            return Objects.equals(n.id, id);
        }
        if (xp.contains("@data-testid=")) {
            String id = xp.replaceAll(".*@data-testid='([^']+)'.*", "$1");
            return Objects.equals(n.testId, id);
        }
        return false;
    }

    @Override
    public String getPageSource() {
        return nodes.toString();
    }

    @Override
    public void close() {
        windowHandles.remove(currentHandle);
        currentHandle = windowHandles.isEmpty() ? null : windowHandles.get(0);
        log("close");
    }

    @Override
    public void quit() {
        quit = true;
        log("quit");
        windowHandles.clear();
        nodes.clear();
    }

    @Override
    public java.util.Set<String> getWindowHandles() {
        ensureOpen();
        return new java.util.LinkedHashSet<>(windowHandles);
    }

    @Override
    public String getWindowHandle() {
        ensureOpen();
        return currentHandle;
    }

    @Override
    public TargetLocator switchTo() {
        return new TargetLocator() {
            @Override
            public WebDriver frame(int index) {
                activeFrame = "frame-" + index;
                log("frame:" + activeFrame);
                return FakeDriver.this;
            }

            @Override
            public WebDriver frame(String nameOrId) {
                activeFrame = nameOrId;
                log("frame:" + nameOrId);
                return FakeDriver.this;
            }

            @Override
            public WebDriver frame(WebElement frameElement) {
                activeFrame = frameElement.getAttribute("id");
                log("frame:" + activeFrame);
                return FakeDriver.this;
            }

            @Override
            public WebDriver parentFrame() {
                activeFrame = null;
                return FakeDriver.this;
            }

            @Override
            public WebDriver window(String nameOrHandle) {
                if (!windowHandles.contains(nameOrHandle)) {
                    throw new org.openqa.selenium.NoSuchWindowException(nameOrHandle);
                }
                currentHandle = nameOrHandle;
                log("window:" + nameOrHandle);
                return FakeDriver.this;
            }

            @Override
            public WebDriver newWindow(org.openqa.selenium.WindowType typeHint) {
                String h = UUID.randomUUID().toString();
                windowHandles.add(h);
                windowTitles.put(h, "");
                currentHandle = h;
                return FakeDriver.this;
            }

            @Override
            public WebDriver defaultContent() {
                activeFrame = null;
                log("defaultContent");
                return FakeDriver.this;
            }

            @Override
            public WebElement activeElement() {
                return findElements(By.cssSelector("*")).stream().findFirst()
                        .orElseThrow(() -> new NoSuchElementException("no active"));
            }

            @Override
            public org.openqa.selenium.Alert alert() {
                if (alertQueue.isEmpty()) {
                    throw new org.openqa.selenium.NoAlertPresentException();
                }
                String text = alertQueue.remove(0);
                return new org.openqa.selenium.Alert() {
                    @Override public void dismiss() { log("alert:dismiss"); }
                    @Override public void accept() { log("alert:accept"); }
                    @Override public String getText() { return text; }
                    @Override public void sendKeys(String keysToSend) { log("alert:keys:" + keysToSend); }
                };
            }
        };
    }

    public void enqueueAlert(String text) {
        alertQueue.add(text);
    }

    @Override
    public Navigation navigate() {
        return new Navigation() {
            @Override public void back() { log("back"); }
            @Override public void forward() { log("forward"); }
            @Override public void to(String url) { get(url); }
            @Override public void to(java.net.URL url) { get(url.toString()); }
            @Override public void refresh() { log("refresh"); }
        };
    }

    @Override
    public Options manage() {
        return new Options() {
            @Override public org.openqa.selenium.logging.Logs logs() { return null; }
            @Override public void addCookie(org.openqa.selenium.Cookie cookie) {}
            @Override public void deleteCookieNamed(String name) {}
            @Override public void deleteCookie(org.openqa.selenium.Cookie cookie) {}
            @Override public void deleteAllCookies() {}
            @Override public org.openqa.selenium.Cookie getCookieNamed(String name) { return null; }
            @Override public java.util.Set<org.openqa.selenium.Cookie> getCookies() { return java.util.Set.of(); }
            @Override public Timeouts timeouts() {
                return new Timeouts() {
                    private Duration implicit = Duration.ZERO;
                    @Override public Timeouts implicitlyWait(Duration duration) { implicit = duration; return this; }
                    @Override public Timeouts scriptTimeout(Duration duration) { return this; }
                    @Override public Timeouts pageLoadTimeout(Duration duration) { return this; }
                    @Override public Duration getImplicitWaitTimeout() { return implicit; }
                    @Override public Duration getScriptTimeout() { return Duration.ofSeconds(30); }
                    @Override public Duration getPageLoadTimeout() { return Duration.ofSeconds(30); }
                    @Deprecated
                    public Timeouts implicitlyWait(long time, java.util.concurrent.TimeUnit unit) {
                        return implicitlyWait(Duration.ofMillis(unit.toMillis(time)));
                    }
                    @Deprecated
                    public Timeouts setScriptTimeout(long time, java.util.concurrent.TimeUnit unit) {
                        return scriptTimeout(Duration.ofMillis(unit.toMillis(time)));
                    }
                    @Deprecated
                    public Timeouts pageLoadTimeout(long time, java.util.concurrent.TimeUnit unit) {
                        return pageLoadTimeout(Duration.ofMillis(unit.toMillis(time)));
                    }
                };
            }
            @Override public Window window() {
                return new Window() {
                    @Override public void setSize(org.openqa.selenium.Dimension targetSize) {}
                    @Override public void setPosition(org.openqa.selenium.Point targetPosition) {}
                    @Override public org.openqa.selenium.Dimension getSize() { return new org.openqa.selenium.Dimension(1280, 720); }
                    @Override public org.openqa.selenium.Point getPosition() { return new org.openqa.selenium.Point(0, 0); }
                    @Override public void maximize() {}
                    @Override public void minimize() {}
                    @Override public void fullscreen() {}
                };
            }
        };
    }

    private void ensureOpen() {
        if (quit) {
            throw new org.openqa.selenium.NoSuchSessionException("Session quit");
        }
    }
}
