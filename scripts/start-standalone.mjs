import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {spawn} from "node:child_process";

const repoRoot = process.cwd();
const envFilePath = resolve(repoRoot, ".env.local");
const serverPath = resolve(repoRoot, ".next", "standalone", "server.js");

if (existsSync(envFilePath)) {
  const content = readFileSync(envFilePath, "utf8");

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    process.env[key] = normalizeEnvValue(rawValue);
  }
}

if (!Object.prototype.hasOwnProperty.call(process.env, "MADRASTI_LOCAL_RUNTIME")) {
  process.env.MADRASTI_LOCAL_RUNTIME = "true";
}

process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

const child = spawn(process.execPath, [serverPath], {
  cwd: repoRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

for (const eventName of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(eventName, () => {
    if (!child.killed) {
      child.kill(eventName);
    }
  });
}

function normalizeEnvValue(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
