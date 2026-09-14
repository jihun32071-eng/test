#!/usr/bin/env node
/* signal/index.html → app-signal/www/index.html
 *
 * 앱 코드는 한 곳(signal/index.html)에만 있습니다. 여기서는 그대로 복사만 합니다.
 * 그 파일은 바깥으로 요청을 하나도 보내지 않게 만들어 두었으므로 — 웹폰트도,
 * 서비스워커도 없습니다 — APK 안에서 손볼 것이 없습니다. 비행기 모드에서도
 * 첫 실행부터 그대로 뜹니다.
 */
import { copyFileSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(app, "..", "signal", "index.html");
const www = join(app, "www");

const html = readFileSync(src, "utf8");

// 바깥 요청이 섞여 들어오면 오프라인에서 조용히 깨집니다. 빌드에서 막습니다.
const remote = html.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/gi);
if (remote) {
  throw new Error(`바깥 자산을 참조하고 있습니다 — 앱에 넣기 전에 인라인하세요:\n  ${remote.join("\n  ")}`);
}

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
writeFileSync(join(www, "index.html"), html);

// manifest 와 아이콘은 웹에서 "홈 화면에 추가" 하는 사람들을 위한 것이라
// APK 안에서는 쓸 일이 없습니다. 그래도 같이 넣습니다 — 몇 KB 이고,
// 빼면 index.html 이 없는 파일을 가리키게 됩니다.
const extras = ["app.webmanifest", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
for (const name of extras) copyFileSync(join(app, "..", "signal", name), join(www, name));

console.log(`www/index.html — ${html.length.toLocaleString()} bytes (+ ${extras.length}개 자산)`);
