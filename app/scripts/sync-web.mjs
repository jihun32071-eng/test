/**
 * 웹 게임 원본(digimon/index.html)을 안드로이드 앱의 www/ 로 복사한다.
 * 원본은 그대로 두고, 앱에서만 필요한 Capacitor 런타임 스크립트를 주입한다.
 * 게임 코드는 window.Capacitor 존재 여부로 분기하므로 웹 버전은 손댈 필요가 없다.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const SRC  = resolve(root, "../digimon/index.html");
const WWW  = resolve(root, "www");
const CORE = resolve(root, "node_modules/@capacitor/core/dist/capacitor.js");

mkdirSync(WWW, { recursive: true });

let html = readFileSync(SRC, "utf8");
const tag = '<script src="capacitor.js"></script>';
if (!html.includes(tag)) {
  const at = html.indexOf("<script>");
  if (at < 0) throw new Error("게임 스크립트 태그를 찾지 못했습니다: " + SRC);
  html = html.slice(0, at) + tag + "\n" + html.slice(at);
}
writeFileSync(resolve(WWW, "index.html"), html);
copyFileSync(CORE, resolve(WWW, "capacitor.js"));
console.log("www/index.html + www/capacitor.js 생성 완료 (" + html.length + " bytes)");
