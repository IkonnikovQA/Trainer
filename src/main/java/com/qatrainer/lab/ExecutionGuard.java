package com.qatrainer.lab;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public final class ExecutionGuard {

    private ExecutionGuard() {}

    public static <T> T run(Callable<T> task, long timeoutMs) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "student-code");
            t.setDaemon(true);
            return t;
        });
        Future<T> future = pool.submit(task);
        try {
            return future.get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new TimeoutException("Превышен лимит выполнения (" + timeoutMs + " мс). Проверь циклы и ожидания.");
        } catch (ExecutionException e) {
            Throwable cause = e.getCause() == null ? e : e.getCause();
            if (cause instanceof Exception ex) {
                throw ex;
            }
            throw new RuntimeException(cause);
        } finally {
            pool.shutdownNow();
        }
    }
}
