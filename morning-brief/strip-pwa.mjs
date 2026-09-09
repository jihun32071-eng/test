/* index.html 의 PWA 조각을 걷어냅니다.
 *
 * 두 곳이 같은 규칙을 씁니다:
 *   - build-artifact.mjs — 아티팩트는 파일을 하나만 올릴 수 있어 manifest·sw.js 가 없습니다
 *   - app/scripts/sync-web.mjs — APK 는 자산이 이미 기기 안에 있고, 앱을 업데이트해도
 *     서비스워커 캐시가 남아 옛 화면을 계속 내줍니다
 *
 * 마커는 index.html 안의 <!--pwa:start--> … <!--pwa:end--> 와
 * /*pwa:start* / … /*pwa:end* / (스크립트 안에서는 HTML 주석을 못 쓰므로).
 */
const HTML = /[ \t]*<!--pwa:start-->[\s\S]*?<!--pwa:end-->\n?/g;
const JS   = /[ \t]*\/\*pwa:start\*\/[\s\S]*?\/\*pwa:end\*\/\n?/g;

export function stripPwa(source) {
  return source.replace(HTML, "").replace(JS, "");
}

/** 마커 짝이 안 맞아 조각이 남았으면 조용히 넘어가지 않고 빌드를 세웁니다. */
export function assertStripped(source) {
  if (/<!--pwa:|\/\*pwa:/.test(source)) {
    throw new Error("PWA 마커가 남았습니다 — index.html 에서 짝이 맞는지 확인하세요");
  }
  return source;
}
