#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectDir = path.resolve(process.argv[2] ?? ".");
const fixture = path.join(projectDir, "src", "lint-verification.tsx");
const linter = path.join(projectDir, "node_modules", "oxlint", "bin", "oxlint");
const broken = `
import { useEffect, useState } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
export function Broken({ enabled, id }: { enabled: boolean; id: string }) {
  if (enabled) useState(0);
  useEffect(() => { console.log(id); }, []);
  const client = new QueryClient();
  useQuery({ queryKey: ['record'], queryFn: () => Promise.resolve(id) });
  fetch('/_api/accounts');
  return <button onClick={async () => { await fetch('/_api/accounts'); }}>{client.isFetching()}</button>;
}
export function Mutating({ value }: { value: { count: number } }) {
  value.count += 1;
  return <div>{value.count}</div>;
}
export const helper = () => 42;
`;
const corrected = `
import { useEffect, useState } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
export function Corrected({ id }: { id: string }) {
  useEffect(() => { console.log(id); }, [id]);
  const [client] = useState(() => new QueryClient());
  useQuery({ queryKey: ['record', id], queryFn: () => Promise.resolve(id) });
  return <button onClick={() => { void fetch('/_api/accounts'); }}>{client.isFetching()}</button>;
}
export function Reading({ value }: { value: { count: number } }) {
  return <div>{value.count}</div>;
}
`;
const expected = new Map([
  ["react(only-export-components)", "error"],
  ["react-hooks(rules-of-hooks)", "error"],
  ["react-hooks(exhaustive-deps)", "warning"],
  ["react-hooks-js(immutability)", "error"],
  ["@tanstack/query(stable-query-client)", "error"],
  ["@tanstack/query(exhaustive-deps)", "error"],
  ["typescript(no-floating-promises)", "error"],
  ["typescript(no-misused-promises)", "error"],
]);

function lint() {
  const result = spawnSync(process.execPath, [linter, "--format", "json", fixture], {
    cwd: projectDir,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  assert.equal(result.signal, null, result.stderr);
  return { status: result.status, diagnostics: JSON.parse(result.stdout).diagnostics };
}

// Exclusive creation prevents overwriting an application file.
fs.writeFileSync(fixture, broken, { flag: "wx" });
try {
  const failures = lint();
  assert.equal(failures.status, 1, "Broken example must fail lint");
  for (const [code, severity] of expected) {
    assert.ok(failures.diagnostics.some((item) => item.code === code && item.severity === severity),
      `Missing lint protection: ${code} (${severity})`);
  }
  fs.writeFileSync(fixture, corrected);
  const passing = lint();
  assert.equal(passing.status, 0, JSON.stringify(passing.diagnostics));
  assert.deepEqual(passing.diagnostics, [], "Corrected example must have no diagnostics");
  console.log("Generated lint checks passed: eight regressions rejected, corrected example accepted.");
} finally {
  fs.unlinkSync(fixture);
}
