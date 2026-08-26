# Flaky triage playbook (Wave 4)

Когда тест красный/зелёный хаотично:

1. **Reproduce** — локально 5–10 раз; зафиксируй seed/данные.
2. **Classify** — wait? данные? порядок? сеть? shared state?
3. **Fix root cause** — explicit wait / уникальные данные / изоляция — не только retry.
4. **Quarantine** — только с тикетом и сроком.
5. **Metric** — flake% до/после в PR.

Шаблон тикета: `FLAKE: <test> | rate | last green | owner`.
