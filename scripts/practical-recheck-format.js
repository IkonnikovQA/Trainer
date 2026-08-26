const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function save(rel, data) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(data, null, 2) + "\n");
  console.log("saved", rel);
}

function setRevealAll(lesson, value = 2) {
  for (const ex of lesson.exercises || []) {
    ex.revealAfterFails = value;
  }
}

// Junior
{
  const l = load("junior/j-git.json");
  const e = l.exercises[0];
  e.title = "Git hygiene checklist";
  e.description = "Input: YAML policy text. Output: valid checklist with keys branch_pattern, gitignore_entries, pr_requires_ci. Expected behavior: include all required keys, no secrets (password).";
  e.hints = [
    "Start from required keys and keep one value per key",
    "Use branch naming rule and minimal gitignore entries",
    "Add pr_requires_ci as boolean policy flag"
  ];
  setRevealAll(l, 2);
  save("junior/j-git.json", l);
}

{
  const l = load("junior/j-debug.json");
  const e = l.exercises[0];
  e.description = "Input: error message string. Output: WAIT/ASSERT/LOCATOR/OTHER. Expected behavior: timeout -> WAIT, assert/assertion -> ASSERT, nosuchelement -> LOCATOR, otherwise OTHER. Edge cases: null -> OTHER.";
  e.hints = [
    "Normalize input first: toLowerCase()",
    "Check markers in stable order: timeout, assert, nosuchelement",
    "Fallback branch should return OTHER"
  ];
  if (!e.mode) e.mode = "java";
  setRevealAll(l, 2);
  save("junior/j-debug.json", l);
}

{
  const l = load("junior/j-testng-vs-junit.json");
  const e = l.exercises[0];
  e.title = "Framework choice policy";
  e.description = "Input: hasTestNgXml flag. Output: framework id string. Expected behavior: return testng if legacy XML suites exist, otherwise junit5.";
  e.hints = [
    "Model this as a tiny policy function, not runtime switching",
    "Check legacy TestNG suite flag first",
    "Default branch should be junit5"
  ];
  setRevealAll(l, 2);
  save("junior/j-testng-vs-junit.json", l);
}

{
  const l = load("junior/j-waits.json");
  const e = l.exercises[0];
  e.title = "Explicit wait visibility";
  e.description = "Input: WebDriver, By locator, timeout seconds. Output: visible WebElement. Expected behavior: wait for visibilityOfElementLocated(by) using WebDriverWait; if not visible within timeout, test should fail.";
  e.hints = [
    "Build WebDriverWait with Duration.ofSeconds(seconds)",
    "Use ExpectedConditions.visibilityOfElementLocated(by)",
    "Return wait.until(...) result"
  ];
  setRevealAll(l, 2);
  save("junior/j-waits.json", l);
}

{
  const l = load("junior/j-locators.json");
  l.exercises[0].description = "Input: id string. Output: By locator. Expected behavior: return CSS selector by data-testid attribute exactly for given id.";
  l.exercises[0].hints = [
    "Use CSS attribute selector syntax",
    "Interpolate id inside [data-testid='...']",
    "Return By.cssSelector(...)"
  ];
  l.exercises[1].description = "Input: button text variable. Output: By locator. Expected behavior: build XPath //button[normalize-space()='text'] using provided variable.";
  l.exercises[1].hints = [
    "Use normalize-space() for text match",
    "Build XPath with variable interpolation",
    "Return By.xpath(...) with exact template"
  ];
  setRevealAll(l, 2);
  save("junior/j-locators.json", l);
}

{
  const l = load("junior/j-pom-intro.json");
  const e = l.exercises[0];
  e.description = "Input: user email and password. Output: welcome text from #welcome. Expected behavior: fill email/password, click submit, return welcome text. Edge case: keep method deterministic for given fixture.";
  e.hints = [
    "Store page locators as By fields",
    "Perform sendKeys for both inputs before click",
    "Return text from welcome element"
  ];
  setRevealAll(l, 2);
  save("junior/j-pom-intro.json", l);
}

// Middle
{
  const l = load("middle/m-junit-extensions.json");
  const e = l.exercises[0];
  e.description = "Input: ExtensionContext in beforeEach callback. Output: helper startedAt() returns stored Long. Expected behavior: write startedAt to Store under Namespace timing and keep context reference.";
  e.hints = [
    "Use ExtensionContext.Store with stable namespace",
    "Store both timestamp and latest context reference",
    "Read startedAt via last.getStore(...).get(..., Long.class)"
  ];
  setRevealAll(l, 2);
  save("middle/m-junit-extensions.json", l);
}

{
  const l = load("middle/m-invocation-interceptor.json");
  const e = l.exercises[0];
  e.description = "Input: JUnit Invocation in interceptTestMethod. Output: CALLS counter increment + normal test execution. Expected behavior: increment counter then call invocation.proceed() exactly once.";
  e.hints = [
    "Interceptor wraps actual test invocation",
    "Increment counter before proceed",
    "Proceed must always be called for test to run"
  ];
  setRevealAll(l, 2);
  save("middle/m-invocation-interceptor.json", l);
}

{
  const l = load("middle/m-ra-filter.json");
  const e = l.exercises[0];
  e.description = "Input: baseUrl string. Output: HTTP status code from /ping. Expected behavior: create Filter, generate request id, add to IDS, attach X-Request-Id header, continue chain via ctx.next(req, resp).";
  e.hints = [
    "Filter should mutate req and continue chain",
    "Collect generated id before ctx.next",
    "Run GET /ping with given().filter(filter)"
  ];
  setRevealAll(l, 2);
  save("middle/m-ra-filter.json", l);
}

{
  const l = load("middle/m-capstone.json");
  l.exercises[0].description = "Input: checkout email for fake UI page. Output: banner text. Expected behavior: POM fills email, clicks place button, returns order-banner text.";
  l.exercises[1].description = "Input: baseUrl and sku. Output: orderId string. Expected behavior: POST /orders with JSON body and extract orderId from 201 response.";
  l.exercises[2].description = "Input: qty and price for PriceCalc. Output: JUnit test class with totalOk and negativeQty. Expected behavior: assert multiplication and IllegalArgumentException on negative qty.";
  l.exercises[0].hints = [
    "Define By locators for email/place/banner",
    "Apply sendKeys then click in this order",
    "Return banner element text"
  ];
  l.exercises[1].hints = [
    "Prepare JSON body with sku field",
    "POST to /orders and assert 201 status",
    "Extract orderId from response path"
  ];
  l.exercises[2].hints = [
    "One positive and one negative JUnit case",
    "Use assertEquals for total calculation",
    "Use assertThrows for negative qty"
  ];
  setRevealAll(l, 2);
  save("middle/m-capstone.json", l);
}

{
  const l = load("middle/m-allure.json");
  const e = l.exercises[0];
  e.description = "Input: log line and secret token. Output: masked log string. Expected behavior: replace secret occurrences with *** while preserving other text.";
  e.hints = [
    "Do not remove full log line, only sensitive fragment",
    "Use string replace for known secret value",
    "Verify masked output still contains non-secret parts"
  ];
  setRevealAll(l, 2);
  save("middle/m-allure.json", l);
}

{
  const l = load("middle/m-allure-steps.json");
  const e = l.exercises[0];
  e.description = "Input: step name and status list. Output: summary text for report step. Expected behavior: include step name and failed count in deterministic format.";
  e.hints = [
    "Keep output format stable for report parsing",
    "Count failures from status list first",
    "Build summary string from computed values"
  ];
  setRevealAll(l, 2);
  save("middle/m-allure-steps.json", l);
}

{
  const l = load("middle/m-retry-policy.json");
  const e = l.exercises[0];
  e.description = "Input: failsSoFar and maxReruns integers. Output: boolean allow/deny. Expected behavior: allow only while failsSoFar is strictly less than maxReruns.";
  e.hints = [
    "Think of retry budget as remaining attempts",
    "At limit should already be denied",
    "Implement as strict comparison"
  ];
  setRevealAll(l, 2);
  save("middle/m-retry-policy.json", l);
}

// Senior
{
  const l = load("senior/s-framework.json");
  const e = l.exercises[0];
  e.description = "Input: from layer, to layer. Output: boolean dependency allowed. Expected behavior: only outward-to-inward dependency is allowed: tests->pages->core, reverse is forbidden.";
  e.hints = [
    "Map each layer to numeric rank",
    "Reject unknown layer names",
    "Allow only when rank(from) < rank(to)"
  ];
  setRevealAll(l, 2);
  save("senior/s-framework.json", l);
}

{
  const l = load("senior/s-async-messaging.json");
  const e = l.exercises[0];
  e.description = "Input: message id string. Output: processedCount metric. Expected behavior: first delivery increments count, duplicate id does not; different ids increment independently.";
  e.hints = [
    "Use a set to track already processed ids",
    "If id already seen, return without increment",
    "Increment counter only on first add"
  ];
  setRevealAll(l, 2);
  save("senior/s-async-messaging.json", l);
}

{
  const l = load("senior/s-interview-soft.json");
  const e = l.exercises[0];
  e.description = "Input: YAML STAR answer text. Output: valid checklist artifact. Expected behavior: include keys situation, task, action, result, metric and avoid secrets.";
  e.hints = [
    "Describe context and responsibility first",
    "Add concrete action and measurable result",
    "Finish with explicit metric key"
  ];
  setRevealAll(l, 2);
  save("senior/s-interview-soft.json", l);
}

{
  const l = load("senior/s-swagger-coverage.json");
  const e = l.exercises[0];
  e.description = "Input: declared operations count and hit operations count. Output: integer percent. Expected behavior: return hit*100/declared, and 0 when declared is 0.";
  e.hints = [
    "Handle zero declared as explicit guard",
    "Use integer arithmetic for percent",
    "Formula: hit * 100 / declared"
  ];
  setRevealAll(l, 2);
  save("senior/s-swagger-coverage.json", l);
}

{
  const l = load("senior/s-codereview.json");
  const e = l.exercises[0];
  e.description = "Input: list of finding severities. Output: review verdict. Expected behavior: return BLOCKER if any critical finding exists, else NEEDS_WORK for medium findings, else OK.";
  e.hints = [
    "Define priority order of severities first",
    "Scan list for highest severity encountered",
    "Map highest severity to final verdict"
  ];
  setRevealAll(l, 2);
  save("senior/s-codereview.json", l);
}

{
  const l = load("senior/s-jenkinsfile.json");
  const e = l.exercises[0];
  e.description = "Input: Jenkinsfile text. Output: valid pipeline artifact. Expected behavior: include pipeline, stages, parallel browser runs, post section with junit report, and no plaintext password.";
  e.hints = [
    "Start from declarative skeleton: pipeline -> stages -> stage('Test')",
    "Add parallel branches for chrome and firefox mvn runs",
    "Publish junit report in post always block"
  ];
  setRevealAll(l, 2);
  save("senior/s-jenkinsfile.json", l);
}

console.log("format unification updates done");
