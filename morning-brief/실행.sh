#!/bin/sh
# 아침 브리핑 — 로컬에서 열기
#
# 이 폴더에서:   sh 실행.sh
#
# 그냥 index.html 을 더블클릭해도 화면은 뜨지만, 오프라인 캐시와 "앱으로 설치"는
# http(s) 에서만 붙습니다. 그래서 작은 서버를 하나 띄웁니다.
PORT=${PORT:-8000}
DIR=$(cd "$(dirname "$0")" && pwd)
echo "→ http://localhost:$PORT  (끄려면 Ctrl+C)"
command -v open >/dev/null 2>&1 && (sleep 1; open "http://localhost:$PORT") &
exec python3 -m http.server "$PORT" --directory "$DIR"
