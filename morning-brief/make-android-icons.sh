#!/bin/sh
# icon.svg → 안드로이드 런처 아이콘 (app/android-res/)
#
#   sh make-android-icons.sh [헤드리스_크로뮴_경로]
#
# 일반 `chrome --headless` 는 툴바 높이만큼 아래가 잘리니 headless_shell 을 쓰세요.
# 결과 PNG 는 커밋합니다 — CI 에는 크로뮴이 없습니다.
set -e
SHELL_BIN=${1:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
DIR=$(cd "$(dirname "$0")" && pwd)
OUT="$DIR/../app/android-res"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# icon.svg 의 그림 부분만 (배경 사각형 제외)
ART='<g stroke="#E9AB5C" stroke-width="17" stroke-linecap="round" opacity=".85">
  <line x1="256" y1="96"  x2="256" y2="140"/>
  <line x1="140" y1="144" x2="171" y2="175"/>
  <line x1="372" y1="144" x2="341" y2="175"/>
  <line x1="92"  y1="262" x2="136" y2="262"/>
  <line x1="420" y1="262" x2="376" y2="262"/>
</g>
<path d="M152 322 A104 104 0 0 1 360 322 Z" fill="#E9AB5C"/>
<rect x="76" y="322" width="360" height="18" rx="9" fill="#E6EAF1"/>
<rect x="76" y="386" width="220" height="16" rx="8" fill="#48546A"/>
<rect x="76" y="430" width="150" height="16" rx="8" fill="#48546A"/>'

# $1 변형, $2 크기, $3 출력 경로
render() {
  case "$1" in
    square) BG='<rect width="512" height="512" rx="114" fill="#151D28"/>'; SCALE=1 ;;
    round)  BG='<circle cx="256" cy="256" r="256" fill="#151D28"/>';       SCALE=0.82 ;;
    fore)   BG='';                                                        SCALE=0.66 ;;
  esac
  cat > "$TMP/i.html" <<HTMLEOF
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="$2" height="$2">
$BG
<g transform="translate(256 256) scale($SCALE) translate(-256 -256)">$ART</g>
</svg>
HTMLEOF
  mkdir -p "$(dirname "$3")"
  "$SHELL_BIN" --no-sandbox --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --default-background-color=00000000 \
    --window-size="$2","$2" --screenshot="$3" "file://$TMP/i.html" 2>/dev/null
}

# 런처 아이콘: mdpi 48 부터 xxxhdpi 192 까지
set -- "mdpi 48 108" "hdpi 72 162" "xhdpi 96 216" "xxhdpi 144 324" "xxxhdpi 192 432"
for row in "$@"; do
  D=$(echo "$row" | cut -d' ' -f1)
  L=$(echo "$row" | cut -d' ' -f2)   # 레거시·라운드 크기
  F=$(echo "$row" | cut -d' ' -f3)   # 어댑티브 전경 크기 (108dp 캔버스)
  render square "$L" "$OUT/mipmap-$D/ic_launcher.png"
  render round  "$L" "$OUT/mipmap-$D/ic_launcher_round.png"
  render fore   "$F" "$OUT/mipmap-$D/ic_launcher_foreground.png"
  echo "  mipmap-$D ✓"
done

# 플레이스토어·설정 화면용
render square 512 "$OUT/ic_launcher-playstore.png"
echo "완료 → $OUT"
