const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum', 'junior');

const solutions = {
  'j-collections|e1': `import java.util.*;
public class CollectionTasks {
    public int uniqueCount(String[] items) {
        if (items == null) return 0;
        return new HashSet<>(Arrays.asList(items)).size();
    }
}
`,
  'j-collections|e2': `import java.util.*;
public class CollectionTasks {
    public Map<String, Integer> freq(String[] words) {
        Map<String, Integer> map = new HashMap<>();
        if (words == null) return map;
        for (String w : words) map.merge(w, 1, Integer::sum);
        return map;
    }
    public int getCount(String[] words, String key) {
        return freq(words).getOrDefault(key, 0);
    }
}
`,
  'j-control|e1': `public class HttpClass {
    public String classify(int code) {
        if (code >= 200 && code < 300) return "success";
        if (code >= 400 && code < 500) return "client";
        if (code >= 500 && code < 600) return "server";
        return "other";
    }
}
`,
  'j-control|e2': `public class ArraysTask {
    public int sum(int[] nums) {
        if (nums == null || nums.length == 0) return 0;
        int s = 0;
        for (int n : nums) s += n;
        return s;
    }
}
`,
  'j-debug|e1': `public class FailureClass {
    public String classify(String msg) {
        if (msg == null) return "OTHER";
        String m = msg.toLowerCase();
        if (m.contains("timeout")) return "WAIT";
        if (m.contains("assert")) return "ASSERT";
        if (m.contains("nosuchelement")) return "LOCATOR";
        return "OTHER";
    }
}
`,
  'j-exceptions|e1': `public class SafeParse {
    public int parseIntSafe(String s) {
        if (s == null || s.isBlank()) return -1;
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
`,
  'j-git|e1': `public class GitUtils {
    public String branchName(String ticket, String slug) {
        return "feature/" + ticket + "-" + slug.toLowerCase();
    }
}
`,
  'j-maven|e1': `public class MavenUtils {
    public String[] parseArtifact(String gav) {
        return gav.split(":");
    }
    public String groupId(String gav) { return parseArtifact(gav)[0]; }
    public String artifactId(String gav) { return parseArtifact(gav)[1]; }
    public String version(String gav) { return parseArtifact(gav)[2]; }
}
`,
  'j-oop|e1': `public class User {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
    public boolean isAdult() { return age >= 18; }
}
`,
  'j-streams|e1': `public class StreamTasks {
    public int sumEven(int[] nums) {
        if (nums == null) return 0;
        int s = 0;
        for (int n : nums) if (n % 2 == 0) s += n;
        return s;
    }
}
`,
  'j-strings|e1': `public class TextUtils {
    public String normalizeEmail(String email) {
        if (email == null) return "";
        return email.trim().toLowerCase();
    }
}
`,
  'j-strings|e2': `public class TextUtils {
    public int extractInt(String price) {
        if (price == null) return -1;
        String digits = price.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return -1;
        return Integer.parseInt(digits);
    }
}
`,
  'j-types|e2': `public class Basics {
    public String formatStatus(int code, boolean ok) {
        return "code=" + code + ";ok=" + ok;
    }
}
`
};

let patched = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith('.json'))) {
  const rel = path.join(root, file);
  const L = JSON.parse(fs.readFileSync(rel, 'utf8'));
  let changed = false;
  for (const e of L.exercises || []) {
    const key = L.id + '|' + e.id;
    if (solutions[key] && (!e.solutionCode || !String(e.solutionCode).trim())) {
      e.solutionCode = solutions[key];
      changed = true;
      patched++;
    }
  }
  // QA reframes + extra tests for git/debug
  if (L.id === 'j-git') {
    L.summary = (L.summary || '') + ' В автотестах ветки помогают изолировать фичи и PR-проверки.';
    const e = L.exercises[0];
    e.description =
      'branchName(ticket, slug): "feature/TICKET-slug" (slug lower-case). Нужно QA, чтобы единообразно именовать ветки под тикеты.';
    if (!e.testCases.some((t) => t.name === 'slug-case')) {
      e.testCases.push({
        name: 'slug-case',
        callExpression: 'branchName("BUG-1", "FlakyFix")',
        expected: 'feature/BUG-1-flakyfix',
        expectedType: 'string'
      });
    }
    changed = true;
  }
  if (L.id === 'j-debug') {
    L.summary =
      'Классификация логов падений ускоряет triage flaky/CI — навык Junior QA Automation.';
    const e = L.exercises[0];
    e.description =
      'classify(String msg): Timeout→WAIT, Assert/Assertion→ASSERT, NoSuchElement→LOCATOR, иначе OTHER. Так быстрее понимаешь, чинить wait, assert или локатор.';
    if (!e.testCases.some((t) => t.name === 'assert2')) {
      e.testCases.push({
        name: 'assert2',
        callExpression: 'classify("Assert failed: text")',
        expected: 'ASSERT',
        expectedType: 'string'
      });
    }
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(rel, JSON.stringify(L, null, 2) + '\n');
    console.log('updated', file);
  }
}
console.log('solutions patched', patched);

// verify none missing in junior java
let missing = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith('.json'))) {
  const L = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  for (const e of L.exercises || []) {
    if ((!e.mode || e.mode === 'java') && (!e.solutionCode || !e.solutionCode.trim())) {
      console.log('STILL MISSING', L.id, e.id);
      missing++;
    }
  }
}
console.log('missing left', missing);
