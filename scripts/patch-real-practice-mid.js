/**
 * Patch middle/senior lessons with real practice.
 * Run: node scripts/patch-real-practice-mid.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');
function load(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function save(rel, obj) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2), 'utf8');
  console.log('patched', rel);
}

// m-restassured
{
  const L = load('middle/m-restassured.json');
  L.theoryMarkdown += `\n\n## Lab\n\nВ тренажёре поднимается **MockWebServer**. Пиши RestAssured against \`baseUrl\`.\n`;
  L.exercises = [
    {
      id: 'e1',
      title: 'GET /health через RestAssured',
      description: 'Метод checkHealth(String baseUrl): GET {baseUrl}/health, верни status code. Ожидай 200 и body с "UP".',
      difficulty: 'medium',
      mode: 'http',
      className: 'HealthClient',
      httpStubJson: JSON.stringify({
        stubs: [{ status: 200, body: '{"status":"UP"}', headers: { 'Content-Type': 'application/json' } }]
      }),
      starterCode: `import io.restassured.RestAssured;
import static io.restassured.RestAssured.*;

public class HealthClient {
    public int checkHealth(String baseUrl) {
        // TODO: given().when().get(baseUrl + "/health").then()... statusCode
        return 0;
    }
}
`,
      solutionCode: `import static io.restassured.RestAssured.*;

public class HealthClient {
    public int checkHealth(String baseUrl) {
        return given()
            .when()
            .get(baseUrl + "/health")
            .then()
            .statusCode(200)
            .extract().statusCode();
    }
}
`,
      hints: [
        'given().when().get(baseUrl + "/health")',
        '.then().statusCode(200).extract().statusCode()'
      ],
      verifierCode: `import java.util.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {
    List<String> fails = new ArrayList<>();
    Object c = cls.getDeclaredConstructor().newInstance();
    int code = (Integer) cls.getMethod("checkHealth", String.class).invoke(c, baseUrl);
    if (code != 200) fails.add("status expected 200, got " + code);
    return fails;
  }
}`
    },
    {
      id: 'e2',
      title: 'Bearer login token',
      description: 'loginToken(baseUrl, user, pass): POST /login JSON {"user","pass"}, верни token из body. Stub вернёт {"token":"abc"}.',
      difficulty: 'hard',
      mode: 'http',
      className: 'AuthClient',
      httpStubJson: JSON.stringify({
        stubs: [{ status: 200, body: '{"token":"abc"}', headers: { 'Content-Type': 'application/json' }, times: 2 }]
      }),
      starterCode: `import static io.restassured.RestAssured.*;
import io.restassured.http.ContentType;

public class AuthClient {
    public String loginToken(String baseUrl, String user, String pass) {
        // TODO POST baseUrl+"/login" with JSON body, return jsonPath token
        return null;
    }
}
`,
      solutionCode: `import static io.restassured.RestAssured.*;
import io.restassured.http.ContentType;

public class AuthClient {
    public String loginToken(String baseUrl, String user, String pass) {
        String body = "{\\"user\\":\\"" + user + "\\",\\"pass\\":\\"" + pass + "\\"}";
        return given()
            .contentType(ContentType.JSON)
            .body(body)
            .when()
            .post(baseUrl + "/login")
            .then()
            .statusCode(200)
            .extract().path("token");
    }
}
`,
      hints: [
        'contentType JSON + body',
        'extract().path("token")'
      ],
      verifierCode: `import java.util.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {
    List<String> fails = new ArrayList<>();
    Object c = cls.getDeclaredConstructor().newInstance();
    String token = (String) cls.getMethod("loginToken", String.class, String.class, String.class)
        .invoke(c, baseUrl, "u", "p");
    if (!"abc".equals(token)) fails.add("token expected abc, got " + token);
    return fails;
  }
}`
    }
  ];
  save('middle/m-restassured.json', L);
}

// m-advanced-selenium
{
  const L = load('middle/m-advanced-selenium.json');
  L.exercises = [{
    id: 'e1',
    title: 'Frame + defaultContent',
    description: 'readFrameText(driver, frameId, by): switchTo frame, getText, defaultContent, верни текст.',
    difficulty: 'medium',
    mode: 'selenium-fake',
    className: 'FrameLab',
    fixtureJson: JSON.stringify({
      elements: [
        { tag: 'iframe', id: 'pay', text: '' },
        { tag: 'span', id: 'amount', text: '100', frameId: 'pay', displayed: true }
      ]
    }),
    starterCode: `import org.openqa.selenium.*;

public class FrameLab {
    public String readFrameText(WebDriver driver, String frameId, By by) {
        // TODO switchTo().frame / getText / defaultContent
        return null;
    }
}
`,
    solutionCode: `import org.openqa.selenium.*;

public class FrameLab {
    public String readFrameText(WebDriver driver, String frameId, By by) {
        driver.switchTo().frame(frameId);
        String text = driver.findElement(by).getText();
        driver.switchTo().defaultContent();
        return text;
    }
}
`,
    hints: ['switchTo().frame(frameId)', 'не забудь defaultContent()'],
    verifierCode: `import java.util.*;
import org.openqa.selenium.*;
import com.qatrainer.lab.selenium.FakeDriver;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lab = cls.getDeclaredConstructor().newInstance();
    String t = (String) cls.getMethod("readFrameText", WebDriver.class, String.class, By.class)
        .invoke(lab, driver, "pay", By.id("amount"));
    if (!"100".equals(t)) fails.add("expected 100, got " + t);
    FakeDriver fake = (FakeDriver) driver;
    if (!fake.getActionsLog().contains("defaultContent")) fails.add("defaultContent не вызван");
    return fails;
  }
}`
  }];
  save('middle/m-advanced-selenium.json', L);
}

// m-parallel
{
  const L = load('middle/m-parallel.json');
  L.exercises = [{
    id: 'e1',
    title: 'ThreadLocal DriverHolder',
    description: 'Реализуй DriverHolder с ThreadLocal<String>: set/get/clear. Метод sameAcrossThreads() должен вернуть false (два потока — разные значения).',
    difficulty: 'hard',
    mode: 'java',
    className: 'DriverHolder',
    starterCode: `public class DriverHolder {
    // TODO ThreadLocal<String>

    public void set(String id) { }
    public String get() { return null; }
    public void clear() { }

    public boolean sameAcrossThreads() throws Exception {
        set("main");
        final String[] other = new String[1];
        Thread t = new Thread(() -> {
            set("worker");
            other[0] = get();
            clear();
        });
        t.start();
        t.join();
        String main = get();
        clear();
        return main != null && main.equals(other[0]);
    }
}
`,
    solutionCode: `public class DriverHolder {
    private static final ThreadLocal<String> TL = new ThreadLocal<>();

    public void set(String id) { TL.set(id); }
    public String get() { return TL.get(); }
    public void clear() { TL.remove(); }

    public boolean sameAcrossThreads() throws Exception {
        set("main");
        final String[] other = new String[1];
        Thread t = new Thread(() -> {
            set("worker");
            other[0] = get();
            clear();
        });
        t.start();
        t.join();
        String main = get();
        clear();
        return main != null && main.equals(other[0]);
    }
}
`,
    hints: ['private static final ThreadLocal<String> TL = new ThreadLocal<>();', 'set/get/remove'],
    testCases: [
      { name: 'isolated', callExpression: 'sameAcrossThreads()', expected: 'false', expectedType: 'boolean' }
    ]
  }];
  save('middle/m-parallel.json', L);
}

// m-mockito
{
  const L = load('middle/m-mockito.json');
  L.exercises = [{
    id: 'e1',
    title: 'Mockito stub + verify',
    description: 'В PaymentServiceTest замокай Gateway.charge(amount) → "OK", вызови service.pay(10), verify gateway.charge(10).',
    difficulty: 'medium',
    mode: 'junit',
    className: 'PaymentServiceTest',
    supportSources: {
      Gateway: `public interface Gateway { String charge(int amount); }`,
      PaymentService: `public class PaymentService {
  private final Gateway gateway;
  public PaymentService(Gateway gateway) { this.gateway = gateway; }
  public String pay(int amount) { return gateway.charge(amount); }
}`
    },
    starterCode: `import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PaymentServiceTest {
    @Test
    void payDelegatesToGateway() {
        // TODO mock Gateway, stub charge, call pay, assert + verify
    }
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PaymentServiceTest {
    @Test
    void payDelegatesToGateway() {
        Gateway gateway = mock(Gateway.class);
        when(gateway.charge(10)).thenReturn("OK");
        PaymentService service = new PaymentService(gateway);
        assertEquals("OK", service.pay(10));
        verify(gateway).charge(10);
    }
}
`,
    hints: ['Gateway g = mock(Gateway.class);', 'when(g.charge(10)).thenReturn("OK"); verify(g).charge(10);']
  }];
  save('middle/m-mockito.json', L);
}

// s-jenkins artifact
{
  const L = load('senior/s-jenkins.json');
  L.exercises = [{
    id: 'e1',
    title: 'Напиши Jenkinsfile fragment',
    description: 'В редакторе — текст Jenkinsfile (не Java). Нужны: pipeline, stages, stage Test с mvn test, post с junit. Без секретов password=.',
    difficulty: 'medium',
    mode: 'artifact',
    artifactKind: 'jenkinsfile',
    artifactRules: ['contains:pipeline', 'contains:stages', 'contains:mvn', 'contains:post', 'contains:junit', 'noSecret:password'],
    className: 'Jenkinsfile',
    starterCode: `pipeline {
  agent any
  stages {
    // TODO stage Build/Test
  }
  post {
    // TODO junit reports
  }
}
`,
    solutionCode: `pipeline {
  agent any
  stages {
    stage('Build') { steps { sh 'mvn -B -DskipTests package' } }
    stage('Test')  { steps { sh 'mvn -B test' } }
  }
  post {
    always {
      junit '**/surefire-reports/*.xml'
    }
  }
}
`,
    hints: ["stage('Test') { steps { sh 'mvn -B test' } }", "post { always { junit '**/surefire-reports/*.xml' } }"]
  }];
  save('senior/s-jenkins.json', L);
}

// s-docker
{
  const L = load('senior/s-docker.json');
  L.exercises = [{
    id: 'e1',
    title: 'Dockerfile с кэшем Maven',
    description: 'Напиши Dockerfile: FROM maven, COPY pom.xml раньше COPY src, RUN mvn dependency или test. Без PASSWORD=.',
    difficulty: 'medium',
    mode: 'artifact',
    artifactKind: 'dockerfile',
    artifactRules: ['contains:FROM', 'contains:COPY pom.xml', 'pomBeforeSrc', 'contains:mvn', 'noSecret:PASSWORD'],
    className: 'Dockerfile',
    starterCode: `FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
# TODO copy pom first, then src, then mvn
`,
    solutionCode: `FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package
`,
    hints: ['COPY pom.xml до COPY src', 'RUN mvn dependency:go-offline']
  }];
  save('senior/s-docker.json', L);
}

// s-compose-grid
{
  const L = load('senior/s-compose-grid.json');
  L.exercises = [{
    id: 'e1',
    title: 'compose с selenium',
    description: 'docker-compose фрагмент: services, image selenium или chrome, без PASSWORD.',
    difficulty: 'easy',
    mode: 'artifact',
    artifactKind: 'compose',
    artifactRules: ['contains:services:', 'contains:image:', 'regex:selenium|chrome|firefox', 'noSecret:PASSWORD'],
    className: 'Compose',
    starterCode: `services:
  # TODO hub/chrome
`,
    solutionCode: `services:
  chrome:
    image: selenium/standalone-chrome:4.25.0
    shm_size: 2gb
    ports:
      - "4444:4444"
`,
    hints: ['services: + image: selenium/standalone-chrome']
  }];
  save('senior/s-compose-grid.json', L);
}

console.log('mid/senior done');
