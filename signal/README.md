# 시그널 수신기

호감 신호를 체크하면 수신 강도가 나오는 체크리스트. 안드로이드 앱으로 씁니다.

## 받기

폰 브라우저에서 **https://jihun32071-eng.github.io/test/signal/install.html** 을 열면
받는 버튼이 나옵니다. 사이트 대문(`https://jihun32071-eng.github.io/test/`)에서도 갈 수 있습니다.

GitHub 에서 직접 받으려면 **[signal-receiver.apk](../../releases/download/signal/signal-receiver.apk)**.
`signal` 태그는 항상 최신 빌드를 가리킵니다.

설치하려면 폰 설정에서 "출처를 알 수 없는 앱 설치"를 한 번 허용해야 합니다.
서명이 없는 디버그 빌드라 플레이스토어 앱과는 별개로 깔립니다.

안드로이드가 아니면 APK 는 쓸 수 없습니다. 대신 `signal/index.html` 을 열어
홈 화면에 추가하면 앱처럼 씁니다 — 기능은 똑같습니다.

> Pages 는 기본 브랜치(`claude/recommendation-3q8oq6`)에서 서비스됩니다.
> 이 파일들이 거기 들어가야 위 주소가 살아납니다.

## 앱에서 하는 일

- **대상별로 따로** — 상단 칩으로 사람을 넘나듭니다. 체크·메모·기록이 각자 남습니다.
  선택된 칩(✎)을 다시 누르면 이름을 바꾸거나 지웁니다.
- **저장** — 앱을 닫아도 그대로입니다. 폰 안(localStorage)에만 있고 어디로도 나가지 않습니다.
- **기록** — "오늘 상태 기록"을 누르면 그날의 수신 강도가 쌓이고, 추세선이 그려집니다.
  한 번의 점수보다 방향이 정확해서 넣었습니다. 상단에는 지난 기록과의 차이(±%p)가 뜹니다.
- **메모** — 실제로 있었던 장면을 적어 둡니다. 기억은 금방 유리해지니까요.
- **결과 복사** — 요약을 클립보드로.
- **화면 모드** — 시스템/밝게/어둡게.
- **뒤로가기** — 대화상자 → 맨 위로 → 한 번 더 누르면 종료.
- **진동** — 체크할 때 짧게. 함정 항목은 한 단계 세게.

점수 계산은 원본 그대로입니다. 신호 항목 가중치 합 55점 만점을 백분율로 바꾸고,
"착각하기 쉬운 것들"에 체크된 개수 × 8%p 를 뺍니다. 함정이 3개 이상이면 붉은색으로
바뀌고 결과 문구에 경고가 붙습니다.

## 구조

```
signal/index.html          앱 코드 전부 (바깥 요청 0 — 웹폰트도 서비스워커도 없음)
signal/install.html        사이트에서 APK 를 받는 페이지
signal/app.webmanifest     홈 화면에 추가했을 때 이름·아이콘 (서비스워커는 없음)
signal/icon.svg            아이콘 원본
signal/icon-*.png          웹·홈화면용 아이콘 (make-android-icons.sh 가 생성)
signal/make-android-icons.sh   icon.svg → 런처 아이콘 + 웹 아이콘 생성
app-signal/                Capacitor 껍데기 (package.json, capacitor.config.json, android-res/)
index.html                 사이트 대문 (앱 목록)
.github/workflows/signal-apk.yml   푸시하면 APK 빌드 → 릴리스 업로드
```

`app-signal/android/` (네이티브 프로젝트)와 `www/` 는 커밋하지 않습니다 — 매번 새로
만듭니다. 아이콘·실행화면만 `android-res/` 에서 덮어씁니다.

## 직접 빌드

안드로이드 SDK 와 JDK 21 이 있으면:

```sh
cd app-signal
npm ci
npm run build:apk
# → android/app/build/outputs/apk/debug/app-debug.apk
```

아이콘을 바꿨다면 `sh signal/make-android-icons.sh` 로 PNG 를 다시 만들고 커밋하세요
(CI 에는 크로뮴이 없습니다). 런처 아이콘과 웹 아이콘이 한 번에 나옵니다.

브라우저에서 그냥 보려면 `signal/index.html` 을 열면 됩니다. 진동과 뒤로가기
처리만 빠지고 나머지는 똑같이 동작합니다.

## 하나만

신호는 확률이지 허락이 아닙니다. 100%가 나와도 "물어봐도 될 것 같다"까지입니다.
상하관계나 업무로 엮인 사이에는 쓰지 마세요 — 상대가 편하게 거절할 수 없습니다.
