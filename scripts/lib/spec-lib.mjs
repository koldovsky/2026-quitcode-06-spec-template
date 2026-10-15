// Утиліти для scripts/check-spec.mjs. Без залежностей: лише node:fs і node:path.
// Корінь репо — поточна тека (process.cwd()).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// AC ID: AC-<AREA>-<NN>, AREA = 2–12 великих латинських літер, NN = рівно дві цифри.
export const AC_ID = "AC-[A-Z]{2,12}-\\d{2}";
export const AC_ID_AT_START = new RegExp(`^${AC_ID}(?![\\w-])`);

export const root = () => process.cwd();

export function rel(file) {
  return path.relative(root(), file).split(path.sep).join("/");
}

export function readText(file) {
  return readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}

// Рекурсивний обхід теки. skip(relPath) → true пропускає файл або теку.
export function walk(dir, { skip = () => false, filter = () => true } = {}) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const r = rel(full);
    if (skip(r)) continue;
    if (statSync(full).isDirectory()) {
      out.push(...walk(full, { skip, filter }));
    } else if (filter(r)) {
      out.push(full);
    }
  }
  return out.sort();
}

export const isMarkdown = (r) => r.endsWith(".md");
export const isArchive = (r) => /^openspec\/changes\/archive(\/|$)/.test(r);

// Тип секції дельти: «## ADDED Requirements» → "ADDED" тощо; у канонічній специфікації — "".
export function deltaKind(section) {
  const m = section.match(/^(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\b/i);
  return m ? m[1].toUpperCase() : "";
}

// Розбір markdown-специфікації: сценарії (#### Scenario: …) і заголовки вимог (### Requirement: …)
// разом із секцією (## …), у якій вони стоять. removed = true для секції «## REMOVED Requirements».
export function parseSpecFile(file) {
  const lines = readText(file).split("\n");
  const scenarios = [];
  const requirements = [];
  let section = "";
  let requirement = null;
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) return;
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      section = h2[1].trim();
      requirement = null;
    }
    const req = line.match(/^###\s+Requirement:\s*(.*)$/);
    if (req) {
      requirement = req[1].trim();
      requirements.push({ name: requirement, kind: deltaKind(section), line: i + 1 });
    }
    const scenario = line.match(/^(#{1,6})\s+Scenario:\s*(.*)$/);
    if (scenario) {
      scenarios.push({
        file,
        line: i + 1,
        level: scenario[1].length,
        title: scenario[2].trim(),
        kind: deltaKind(section),
        requirement,
        removed: deltaKind(section) === "REMOVED",
      });
    }
  });
  return { scenarios, requirements, text: lines.join("\n") };
}

export const parseScenarios = (file) => parseSpecFile(file).scenarios;

export function acIdOf(title) {
  const m = title.match(AC_ID_AT_START);
  return m ? m[0] : null;
}

export function printList(label, items) {
  if (!items.length) return;
  console.log(`\n${label} (${items.length}):`);
  for (const item of items) console.log(`  - ${item}`);
}
