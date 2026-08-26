package com.portfolio.core;

import io.restassured.filter.Filter;
import io.restassured.filter.FilterContext;
import io.restassured.response.Response;
import io.restassured.specification.FilterableRequestSpecification;
import io.restassured.specification.FilterableResponseSpecification;

import java.util.UUID;

/** Observability: каждый API-запрос помечаем correlation id. */
public final class CorrelationFilter implements Filter {
    @Override
    public Response filter(FilterableRequestSpecification requestSpec,
                           FilterableResponseSpecification responseSpec,
                           FilterContext ctx) {
        String id = "qa-" + UUID.randomUUID().toString().substring(0, 8);
        requestSpec.header("X-Request-Id", id);
        return ctx.next(requestSpec, responseSpec);
    }
}
