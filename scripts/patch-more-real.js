const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function patch(file, fn) {
  const p = path.join(root, file);
  const L = JSON.parse(fs.readFileSync(p, 'utf8'));
  fn(L);
  fs.writeFileSync(p, JSON.stringify(L, null, 2) + '\n');
  console.log('patched', file);
}

patch('middle/m-pom-fluent.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'Header component click logo',
      description:
        'Header(WebDriver, By root): метод openLogo() кликает CSS \"a.logo\" внутри root (find element relative). Верни текст #page-title после клика.',
      difficulty: 'hard',
      mode: 'selenium-fake',
      className: 'Header',
      fixtureJson:
        '{"elements":[{"tag":"div","id":"hdr","class":"header","displayed":true},{"tag":"a","id":"logo","class":"logo","text":"Logo","displayed":true},{"tag":"h1","id":"page-title","text":"Home","displayed":true}]}',
      starterCode:
        'import org.openqa.selenium.*;\n\npublic class Header {\n    private final WebDriver driver;\n    private final By root;\n\n    public Header(WebDriver driver, By root) {\n        this.driver = driver;\n        this.root = root;\n    }\n\n    public String openLogo() {\n        // TODO: click By.className("logo") or css a.logo, return #page-title text\n        return null;\n    }\n}\n',
      solutionCode:
        'import org.openqa.selenium.*;\n\npublic class Header {\n    private final WebDriver driver;\n    private final By root;\n\n    public Header(WebDriver driver, By root) {\n        this.driver = driver;\n        this.root = root;\n    }\n\n    public String openLogo() {\n        driver.findElement(By.className("logo")).click();\n        return driver.findElement(By.id("page-title")).getText();\n    }\n}\n',
      hints: [
        'By.className("logo") и By.id("page-title")',
        'click + getText'
      ],
      verifierCode:
        'import java.util.*;\nimport org.openqa.selenium.*;\nimport com.qatrainer.lab.selenium.FakeDriver;\n\npublic class ExerciseVerifier {\n  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {\n    List<String> fails = new ArrayList<>();\n    Object page = cls.getConstructor(WebDriver.class, By.class).newInstance(driver, By.className("header"));\n    String title = (String) cls.getMethod("openLogo").invoke(page);\n    if (!"Home".equals(title)) fails.add("title: " + title);\n    FakeDriver fake = (FakeDriver) driver;\n    if (fake.getActionsLog().stream().noneMatch(a -> a.startsWith("click:"))) fails.add("click missing");\n    return fails;\n  }\n}'
    }
  ];
});

patch('senior/s-dockerfile-practice.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'Dockerfile с кэшем deps',
      description:
        'Напиши Dockerfile: FROM maven:3.9-eclipse-temurin-17, COPY pom.xml раньше src, RUN mvn dependency:go-offline, затем COPY src и RUN mvn -B test.',
      difficulty: 'medium',
      mode: 'artifact',
      artifactKind: 'dockerfile',
      className: 'Dockerfile',
      starterCode:
        'FROM maven:3.9-eclipse-temurin-17\nWORKDIR /app\n# TODO: правильный порядок слоёв\n',
      solutionCode:
        'FROM maven:3.9-eclipse-temurin-17\nWORKDIR /app\nCOPY pom.xml .\nRUN mvn -B dependency:go-offline\nCOPY src ./src\nRUN mvn -B test\n',
      hints: [
        'COPY pom.xml до COPY src',
        'RUN mvn -B dependency:go-offline между ними'
      ]
    }
  ];
});

patch('middle/m-allure.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'SecretMask JUnit',
      description:
        'Допиши SecretMask.mask и тесты: length<=4 → ****; иначе первые2+****+последние2.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'SecretMaskTest',
      starterCode:
        'import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass SecretMask {\n    static String mask(String token) {\n        // TODO\n        return "";\n    }\n}\n\npublic class SecretMaskTest {\n    @Test\n    void shortToken() { assertEquals("****", SecretMask.mask("abcd")); }\n\n    @Test\n    void longToken() { assertEquals("ab****ef", SecretMask.mask("abcdef")); }\n}\n',
      solutionCode:
        'import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass SecretMask {\n    static String mask(String token) {\n        if (token == null || token.length() <= 4) return "****";\n        return token.substring(0, 2) + "****" + token.substring(token.length() - 2);\n    }\n}\n\npublic class SecretMaskTest {\n    @Test\n    void shortToken() { assertEquals("****", SecretMask.mask("abcd")); }\n\n    @Test\n    void longToken() { assertEquals("ab****ef", SecretMask.mask("abcdef")); }\n}\n',
      hints: [
        'if length <= 4 return "****"',
        'substring(0,2) + "****" + substring(len-2)'
      ]
    }
  ];
});

let real = 0,
  tot = 0;
for (const d of ['junior', 'middle', 'senior']) {
  for (const f of fs.readdirSync(path.join(root, d)).filter((x) => x.endsWith('.json'))) {
    const L = JSON.parse(fs.readFileSync(path.join(root, d, f), 'utf8'));
    for (const e of L.exercises || []) {
      tot++;
      if (e.mode && e.mode !== 'java') real++;
    }
  }
}
console.log('real-mode', real + '/' + tot, ((100 * real) / tot).toFixed(1) + '%');
