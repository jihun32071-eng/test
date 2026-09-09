# 디지바이스 제로 — 안드로이드 앱

`digimon/index.html` 게임을 Capacitor로 감싼 안드로이드 앱.
웹 게임과 소스를 공유하며, 앱 전용 동작(하드웨어 뒤로가기, 안전영역, 백그라운드 저장)만
`window.Capacitor` 존재 여부로 분기한다.

- 패키지: `com.jihun.digivicezero`
- 최소 SDK 23 (Android 6.0) / 타깃 SDK 35
- 세로 고정, 다크 테마, 어댑티브 아이콘(모노크롬 포함)

## APK 받기

이 저장소에 푸시하면 GitHub Actions가 자동으로 디버그 APK를 빌드한다.

1. 저장소의 **Actions** → **안드로이드 APK 빌드** 최신 실행을 연다
2. 하단 **Artifacts** 의 `digivice-zero-debug-apk` 를 내려받는다
3. 압축을 풀고 `app-debug.apk` 를 폰으로 옮겨 설치한다
   (설정에서 "출처를 알 수 없는 앱 설치"를 허용해야 한다)

수동으로 돌리려면 Actions 탭에서 **Run workflow** 를 누른다.

## 로컬 빌드

Android SDK가 설치된 환경에서:

```bash
cd app
npm install
npm run sync          # 게임을 www/ 로 복사하고 안드로이드 프로젝트에 반영
npm run build:apk     # android/app/build/outputs/apk/debug/app-debug.apk
```

Android Studio로 열려면 `npm run sync` 후 `npm run open:android`.

> 이 프로젝트가 만들어진 컨테이너에서는 `dl.google.com` 이 네트워크 정책으로 차단되어
> Android SDK와 Android Gradle Plugin을 받을 수 없었다. 그래서 APK 빌드는 CI에 맡긴다.
> 프로젝트 구성 자체는 완전하며, SDK만 있으면 위 명령으로 바로 빌드된다.

## 구조

```
app/
  capacitor.config.json     앱 ID·이름·배경색
  scripts/sync-web.mjs      digimon/index.html → www/ (Capacitor 런타임 주입)
  scripts/make-icons.mjs    게임의 알 스프라이트로 런처 아이콘·스플래시 생성
  resources/icon.png        스토어 등록용 512px 아이콘
  www/                      생성물 (git 미추적)
  android/                  네이티브 프로젝트
```

게임 코드는 `digimon/index.html` **한 곳**에만 있다. `www/` 는 매번 거기서 생성되므로
게임을 고칠 때 앱 쪽을 따로 손댈 필요가 없다.

## 앱 전용 동작

| 동작 | 구현 |
|---|---|
| 하드웨어 뒤로가기 | 모달 → 닫기, 하위 화면 → 메인, 메인 → 두 번 누르면 종료. 전투 중에는 차단 |
| 백그라운드 전환 | `appStateChange`·`pause` 에서 즉시 저장 |
| 노치·제스처 바 | `env(safe-area-inset-*)` 패딩 |
| 확대·텍스트 선택 | `touch-action: manipulation`, 입력란 외 선택 차단 |

## 아이콘 다시 만들기

```bash
node scripts/make-icons.mjs    # playwright 필요
```

`scripts/make-icons.mjs` 상단의 `EGG` 픽셀 격자와 `PAL` 팔레트를 고치면
런처 아이콘·모노크롬 아이콘·스플래시 로고가 한 번에 다시 생성된다.

## 알려진 제한

- 표시용 글꼴(Do Hyeon, IBM Plex Sans KR)은 Google Fonts에서 받는다. 오프라인에서는
  기기 기본 한글 글꼴로 대체되며 게임 진행에는 영향이 없다.
- 디버그 서명 APK라 Play 스토어에는 올릴 수 없다. 스토어용으로는 릴리스 키스토어로
  서명한 `assembleRelease` 빌드가 필요하다.
