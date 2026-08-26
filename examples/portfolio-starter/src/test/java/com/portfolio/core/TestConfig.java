package com.portfolio.core;

public final class TestConfig {
    private TestConfig() {}

    public static String uiBase() {
        return System.getProperty("ui.baseUrl", "https://the-internet.herokuapp.com");
    }

    public static String apiBase() {
        return System.getProperty("api.baseUrl", "https://jsonplaceholder.typicode.com");
    }

    public static boolean skipUi() {
        return Boolean.parseBoolean(System.getProperty("skipUi", "false"));
    }
}
