#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectDir = path.resolve(process.argv[2] ?? ".");
const fixture = path.join(projectDir, "src", "lint-verification.tsx");
const linter = path.join(projectDir, "node_modules", "oxlint", "bin", "oxlint");
const broken = `
import { useEffect, useState } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
export function Broken({ enabled, id, tone }: { enabled: boolean; id: string; tone: string }) {
  if (enabled) useState(0);
  useEffect(() => { console.log(id); }, []);
  const client = new QueryClient();
  useQuery({ queryKey: ['record'], queryFn: () => Promise.resolve(id) });
  fetch('/_api/accounts');
  return <>
    <Button className="p-4">{client.isFetching()}</Button>
    <div className="bg-red-500 p-[13px] flex-cols">Raw design values</div>
    <Button className={\`bg-\${tone}-500\`} onClick={async () => { await fetch('/_api/accounts'); }}>Save</Button>
  </>;
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
import { Button } from '@/components/ui/button';
export function Corrected({ id }: { id: string }) {
  useEffect(() => { console.log(id); }, [id]);
  const [client] = useState(() => new QueryClient());
  useQuery({ queryKey: ['record', id], queryFn: () => Promise.resolve(id) });
  return <Button className="mt-4 w-full" onClick={() => { void fetch('/_api/accounts'); }}>{client.isFetching()}</Button>;
}
export function Reading({ value }: { value: { count: number } }) {
  return <div>{value.count}</div>;
}
`;
const expected = new Map([
	["shadcn(no-restyle)", "error"],
	["shadcn(no-raw-colors)", "error"],
	["shadcn(no-arbitrary-values)", "error"],
	["shadcn(require-static-classes)", "error"],
	["shadcn(no-unknown-classes)", "warning"],
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
  const result = spawnSync(process.execPath, [linter, "--format", "json", path.relative(projectDir, fixture)], {
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
  execFileSync(process.execPath, [path.join(projectDir, "node_modules", "@typescript", "native", "bin", "tsc"), "-b"], {
    cwd: projectDir, stdio: "inherit",
  });
  const passing = lint();
  assert.equal(passing.status, 0, JSON.stringify(passing.diagnostics));
  assert.deepEqual(passing.diagnostics, [], "Corrected example must have no diagnostics");
  console.log("Generated lint checks passed: thirteen regressions rejected, corrected example accepted.");
} finally {
  fs.unlinkSync(fixture);
}
