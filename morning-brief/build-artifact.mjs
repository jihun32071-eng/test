#!/usr/bin/env node
/* index.html → dist/artifact.html
 *
 * 아티팩트로 게시할 때는 플랫폼이 doctype/html/head/body를 직접 감싸므로
 * <title> + 폰트 링크 + <style> + 본문만 남깁니다. PWA 조각(manifest·서비스워커·
 * 설치 버튼)은 아티팩트에서 동작하지 않으니 마커째로 걷어냅니다.
 *
 *   node build-artifact.mjs
 *
 * 소스는 언제나 index.html 하나입니다. 이 파일이 만드는 dist/는 게시용 출력물이라
 * 손으로 고치지 마세요.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripPwa, assertStripped } from "./strip-pwa.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "index.html"), "utf8");

const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`index.html에서 ${what}을(를) 찾지 못했습니다`);
  return m[0];
};

const title = pick(/<title>[\s\S]*?<\/title>/, "<title>");
const style = pick(/<style>[\s\S]*?<\/style>/, "<style>");
const fonts = [...src.matchAll(/<link rel="(?:preconnect|stylesheet)"[^>]*fonts\.g[^>]*>/g)].map(m => m[0]);
const body  = pick(/<body>[\s\S]*<\/body>/, "<body>")
  .replace(/^<body>\n?/, "")
  .replace(/\n?<\/body>$/, "");

const out = assertStripped([
  "<!-- index.html에서 생성됨 — 직접 고치지 말고 build-artifact.mjs를 다시 돌리세요 -->",
  ...fonts,
  title,
  stripPwa(style),
  "",
  stripPwa(body)
].join("\n") + "\n");

mkdirSync(join(here, "dist"), { recursive: true });
writeFileSync(join(here, "dist", "artifact.html"), out);
console.log(`dist/artifact.html — ${out.length.toLocaleString()} bytes`);
