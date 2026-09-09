#!/usr/bin/env node
/* morning-brief/index.html → app/www/index.html
 *
 * 앱 코드는 여전히 한 곳(morning-brief/index.html)에만 있습니다. 여기서는
 * PWA 조각만 걷어내서 www/ 로 복사합니다 — APK 안에서는
 *   - manifest·설치 버튼이 의미가 없고 (이미 설치된 앱입니다)
 *   - 서비스워커는 해로운데, 자산이 이미 기기 안에 있는 데다 앱을 업데이트해도
 *     옛 캐시가 남아 지난 화면을 계속 내주기 때문입니다.
 *
 * 그래서 www/ 에는 index.html 한 개만 들어갑니다. 아이콘·manifest·sw.js 는
 * 스트립 후 아무도 참조하지 않으므로 복사하지 않습니다.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripPwa, assertStripped } from "../../morning-brief/strip-pwa.mjs";

const app = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(app, "..", "morning-brief", "index.html");
const www = join(app, "www");

const html = assertStripped(stripPwa(readFileSync(src, "utf8")));

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
writeFileSync(join(www, "index.html"), html);
console.log(`www/index.html — ${html.length.toLocaleString()} bytes`);
