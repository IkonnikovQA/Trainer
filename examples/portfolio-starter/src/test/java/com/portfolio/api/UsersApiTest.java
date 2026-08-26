package com.portfolio.api;

import com.portfolio.core.CorrelationFilter;
import com.portfolio.core.TestConfig;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class UsersApiTest {

    @Test
    void listUsersOk() {
        given()
                .filter(new CorrelationFilter())
                .when()
                .get(TestConfig.apiBase() + "/users")
                .then()
                .statusCode(200)
                .body("$", not(empty()))
                .body("[0].email", containsString("@"));
    }

    @Test
    void createUser() {
        given()
                .filter(new CorrelationFilter())
                .contentType(ContentType.JSON)
                .body("{\"name\":\"Morpheus\",\"username\":\"neo\",\"email\":\"neo@zion.io\"}")
                .when()
                .post(TestConfig.apiBase() + "/users")
                .then()
                .statusCode(anyOf(is(201), is(200)))
                .body("id", notNullValue())
                .body("name", equalTo("Morpheus"));
    }

    @Test
    void contractHasEmailField() {
        given()
                .filter(new CorrelationFilter())
                .when()
                .get(TestConfig.apiBase() + "/users/1")
                .then()
                .statusCode(200)
                .body("id", equalTo(1))
                .body("email", containsString("@"));
    }
}
