import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Each timezone runs in its own process, without changing the host's timezone.
const timezones = ['UTC', 'America/New_York', 'Asia/Kolkata', 'Pacific/Kiritimati'];
const timezone = process.env.DEEPFOCUS_STREAK_TEST_TZ;

if (!timezone) {
  for (const tz of timezones) {
    test(`getStreak in ${tz}`, () => {
      const env = { ...process.env, TZ: tz, DEEPFOCUS_STREAK_TEST_TZ: tz };
      // A nested runner must not inherit the parent's internal worker marker.
      delete env.NODE_TEST_CONTEXT;
      const result = spawnSync(process.execPath, ['--test', fileURLToPath(import.meta.url)], {
        encoding: 'utf8',
        env,
      });
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    });
  }
} else {
  assert.ok(timezones.includes(timezone));
  assert.equal(process.env.TZ, timezone);

  // Compile the real helper using the app's existing TypeScript dependency.
  const source = readFileSync(new URL('../src/lib/storage.ts', import.meta.url), 'utf8');
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    reportDiagnostics: true,
  });
  assert.equal(diagnostics.length, 0);

  function getStreakAt(now, sessions) {
    const clock = now.getTime();
    class FixedDate extends Date {
      constructor(...args) {
        super(...(args.length ? args : [clock]));
      }
      static now() { return clock; }
    }
    const context = {
      Date: FixedDate,
      exports: {},
      localStorage: {
        getItem(key) {
          assert.equal(key, 'deepfocus_sessions');
          return JSON.stringify(sessions);
        },
      },
    };
    runInNewContext(outputText, context, { filename: 'storage.js' });
    return context.exports.getStreak();
  }

  function session(now, daysAgo, { completed = true, hour = 12, minute = 0 } = {}) {
    const started = new Date(now);
    started.setDate(started.getDate() - daysAgo);
    started.setHours(hour, minute, 0, 0);
    return { started_at: started.toISOString(), completed };
  }

  const now = new Date(2026, 6, 5, 12);
  const cases = [
    ['no sessions', [], 0],
    ['today only', [0], 1],
    ['yesterday only', [1], 1],
    ['no session today with two consecutive prior days', [1, 2], 2],
    ['no session today with a longer streak', [1, 2, 3, 4], 4],
    ['current-day streak', [0, 1, 2, 3], 4],
    ['gap before yesterday', [2, 3], 0],
    ['gap within a prior-day streak', [1, 2, 4], 2],
    ['gap after today', [0, 2, 3], 1],
    ['duplicate and unordered sessions', [2, 1, 2, 1], 2],
    ['future sessions do not extend the streak', [-1, 1, 2], 2],
  ];
  for (const [name, offsets, expected] of cases) {
    test(name, () => {
      assert.equal(getStreakAt(now, offsets.map((offset) => session(now, offset))), expected);
    });
  }

  test('only completed sessions count', () => {
    assert.equal(getStreakAt(now, [session(now, 0, { completed: false })]), 0);
    assert.equal(getStreakAt(now, [
      session(now, 0, { completed: false }), session(now, 1), session(now, 2),
    ]), 2);
    assert.equal(getStreakAt(now, [
      session(now, 1), session(now, 2, { completed: false }), session(now, 3),
    ]), 1);
  });

  for (const [name, date] of [
    ['month boundary', new Date(2026, 4, 2, 12)],
    ['year boundary', new Date(2026, 0, 2, 12)],
    ['leap day', new Date(2024, 2, 2, 12)],
    ['spring daylight-saving transition', new Date(2026, 2, 10, 12)],
    ['autumn daylight-saving transition', new Date(2026, 10, 3, 12)],
  ]) {
    test(name, () => {
      assert.equal(getStreakAt(date, [1, 2, 3, 4].map((offset) => session(date, offset))), 4);
      assert.equal(getStreakAt(date, [0, 1, 2, 3].map((offset) => session(date, offset))), 4);
    });
  }

  test('counts local calendar days across midnight, not UTC dates', () => {
    const midnight = new Date(2026, 6, 5, 0, 10);
    const sessions = [
      session(midnight, 1, { hour: 23, minute: 55 }),
      session(midnight, 1, { hour: 0, minute: 5 }),
      session(midnight, 2, { hour: 23, minute: 55 }),
    ];
    assert.equal(getStreakAt(midnight, sessions), 2);
    sessions.push(session(midnight, 0, { hour: 0, minute: 5 }));
    assert.equal(getStreakAt(midnight, sessions), 3);
  });

  test('preserves the existing 365-day limit for either starting day', () => {
    for (const firstDay of [0, 1]) {
      const sessions = Array.from({ length: 366 }, (_, i) => session(now, firstDay + i));
      assert.equal(getStreakAt(now, sessions), 365);
    }
  });
}
