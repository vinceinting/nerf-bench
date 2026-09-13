'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { gradeTask, totals } = require('../grade.cjs');
const { makeCandidates } = require('../../tasks/fixtures/synthetic.cjs');

test('grading is pass or fail from the check exit code', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-grade-'));
  makeCandidates(root, 1);
  const taskDir = path.join(root, 'candidates', 'fx-000');
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-work-'));
  assert.strictEqual(gradeTask({ taskDir, workdir: work }).pass, false);
  fs.writeFileSync(path.join(work, 'solved.txt'), 'x');
  assert.strictEqual(gradeTask({ taskDir, workdir: work }).pass, true);
  assert.deepStrictEqual(totals([{ pass: true }, { pass: false }, { pass: true }]), { passed: 2, total: 3 });
});
