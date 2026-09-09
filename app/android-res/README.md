# android-res

`npx cap add android` 가 만든 기본 리소스 위에 덮어쓰는 파일들입니다.
Capacitor 기본 아트(카파시터 로고)를 이 앱 것으로 바꾸는 게 전부입니다.

- `mipmap-*/ic_launcher*.png` — 런처 아이콘. `morning-brief/make-android-icons.sh` 로 생성
- `mipmap-anydpi-v26/*.xml` — 어댑티브 아이콘 (Android 8+). 배경은 색, 전경은 mipmap
- `values/ic_launcher_background.xml` — 어댑티브 아이콘 배경색
- `splash.png` — 96×96 단색. 실행 화면(`@drawable/splash`)은 화면 비율에 맞춰
  늘어나는데, 단색이라 늘어나도 티가 안 납니다. 색은 앱의 라이트 배경과
  `capacitor.config.json` 의 `android.backgroundColor` 와 같게 맞췄습니다 —
  실행 화면에서 앱으로 넘어갈 때 색이 튀지 않게

CI 는 `mipmap-*` / `values` 를 통째로 복사하고, `splash.png` 는 기본 프로젝트의
모든 `splash.png` 자리에 덮어씁니다 (가로·세로 × 밀도별로 흩어져 있습니다).
