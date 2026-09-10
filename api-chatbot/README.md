# API 챗봇 (Android · Jetpack Compose)

Anthropic Messages API를 호출해 대화하는 안드로이드 채팅 앱입니다.
Retrofit + OkHttp + kotlinx.serialization, 화면은 Jetpack Compose(Material 3)로 되어 있어요.

```
받는 곳   https://jihun32071-eng.github.io/test/api-chatbot/
APK      https://github.com/jihun32071-eng/test/releases/download/api-chatbot/api-chatbot.apk
```

---

## 1. 폰에 설치해서 쓰기

빌드 도구 없이 그냥 쓰고 싶다면 이 길입니다.

1. 안드로이드 폰 브라우저로 [설치 페이지](https://jihun32071-eng.github.io/test/api-chatbot/)를 엽니다
2. **api-chatbot.apk 받기** 를 눌러 내려받고 설치합니다
   (서명 없는 디버그 빌드라 "출처를 알 수 없는 앱 설치"를 한 번 허용해야 합니다)
3. 앱을 켜면 맨 위에 **API 키 칸**이 뜹니다. [콘솔](https://console.anthropic.com/settings/keys)에서
   만든 `sk-ant-…` 키를 붙여넣고 저장하면 끝

키는 **폰 안에만** 저장됩니다. 앱 파일에는 키가 들어 있지 않아요 —
누구나 받을 수 있는 파일에 키를 넣으면 그대로 새어 나가니까요.
키를 바꾸거나 지우려면 앱 위쪽 열쇠(🔑) 아이콘을 누르세요.

APK 는 `api-chatbot/` 이 바뀔 때마다 GitHub Actions
([`api-chatbot-apk.yml`](../.github/workflows/api-chatbot-apk.yml))가 새로 빌드해
`api-chatbot` 태그 릴리스에 덮어씁니다. 위 주소는 늘 최신 빌드를 가리킵니다.

---

## 2. 소스로 직접 빌드하기

### ① Android Studio 로 열기

`File > Open` 으로 이 폴더를 선택합니다.
처음 열면 Gradle 8.11.1과 의존성을 내려받느라 몇 분 걸릴 수 있어요.

### ② (선택) 키를 미리 넣어 두기

매번 앱에서 키를 넣기 귀찮으면, `local.properties.example` 을 복사해
이름을 **`local.properties`** 로 바꾸고 아래 한 줄을 채웁니다.

```properties
ANTHROPIC_API_KEY=sk-ant-발급받은-키
```

이 값은 앱에 기본 키로 들어가고, 앱에서 키를 저장하면 그 값이 우선합니다.
`local.properties` 는 `.gitignore` 에 들어 있어서 깃에 올라가지 않습니다.

> 이 방식은 APK 에 키가 박힙니다. **내 폰에서만 쓸 때만** 쓰세요.

### ③ 실행

에뮬레이터나 실제 기기를 고르고 ▶ 버튼을 누르면 끝입니다.
터미널에서 빌드하려면 `./gradlew assembleDebug` — APK 는
`app/build/outputs/apk/debug/app-debug.apk` 에 생깁니다.

---

## 3. 파일이 하는 일

```
app/src/main/java/com/example/apichatbot/
├─ MainActivity.kt              앱의 시작점. Compose 화면을 띄웁니다.
├─ ApiChatbotApp.kt             앱이 켜질 때 저장해 둔 API 키를 읽어 옵니다.
├─ data/
│  ├─ ApiKeyStore.kt            API 키를 폰에 저장·조회 (앱에서 입력한 키 → 없으면 빌드에 박힌 키)
│  ├─ ApiModels.kt              요청·응답 JSON의 모양(데이터 클래스)
│  ├─ ClaudeApi.kt              Retrofit 인터페이스 (POST /v1/messages)
│  ├─ Network.kt                Retrofit·OkHttp 조립, 인증 헤더 자동 첨부
│  └─ ChatRepository.kt         호출과 에러 처리를 담당
└─ ui/
   ├─ ChatViewModel.kt          화면 상태(메시지 목록, 로딩, 에러, 키 보유 여부) 관리
   ├─ ChatScreen.kt             말풍선 목록·입력창·API 키/시스템 프롬프트 편집 UI
   └─ theme/                    색과 글자 스타일
```

### 핵심 흐름

```
입력창 → ChatViewModel.send()
       → ChatRepository.send()      ← 지금까지의 대화 전체를 함께 보냄
       → POST https://api.anthropic.com/v1/messages
       → 응답 텍스트를 메시지 목록에 추가 → 말풍선으로 표시
```

API는 이전 대화를 기억하지 않습니다. 그래서 매번 `messages` 배열에
**전체 기록을 담아 보내야** 문맥이 이어져요. `ChatRepository.send()`가 그 일을 합니다.

---

## 4. 바꿔 보면 재미있는 곳

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 챗봇 성격 바꾸기 | 앱 안 ⚙ 아이콘에서 바로 수정, 또는 `ChatUiState.DEFAULT_SYSTEM_PROMPT` |
| 모델 바꾸기 | `ChatRepository.DEFAULT_MODEL` |
| 답변 길이 늘리기 | `ChatRepository.DEFAULT_MAX_TOKENS` |
| 말풍선 색 바꾸기 | `ui/theme/Theme.kt` |

---

## 5. 더 넓게 배포한다면

지금 구조는 **쓰는 사람이 자기 키를 넣는** 방식입니다. 키가 앱 파일에 들어가지
않으니 링크로 나눠 주기에는 안전하지만, 대신 받은 사람마다 키를 만들어야 해요.

```
[지금]   앱 (각자 키 입력)  →  Anthropic        나눠 주기 좋음, 각자 키 필요
[스토어] 앱  →  내 중간 서버 (키 보관)  →  Anthropic
```

키 없이도 쓰게 하려면 중간 서버를 두면 됩니다. 앱에는 키가 없고 서버가 대신 호출해요.
`Network.kt`의 `BASE_URL`을 내 서버 주소로 바꾸고 `x-api-key` 헤더를 빼면
클라이언트 쪽 수정은 거의 끝납니다.

플레이스토어에 올릴 거라면 디버그 서명 대신 **릴리스 서명 키**가 따로 필요합니다.

---

## 6. 자주 나는 오류

| 증상 | 원인과 해결 |
|---|---|
| "API 키가 없어요" | 앱 위쪽 열쇠 아이콘에서 키를 저장했는지 확인 |
| "API 키가 올바르지 않아요" (401) | 키가 잘렸거나 공백이 섞였는지 확인 |
| "모델 이름이 맞는지 확인해 주세요" (404) | 콘솔의 모델 목록과 `DEFAULT_MODEL`이 다른 경우 |
| "요청이 너무 잦아요" (429) | 잠시 뒤 재시도 |
| "인터넷 연결을 확인해 주세요" | 에뮬레이터 네트워크, 매니페스트의 INTERNET 권한 확인 |

---

## 7. 다음으로 해볼 것

- **스트리밍**: 답이 한 글자씩 나오게 하기 (`stream: true` + SSE 파싱)
- **대화 저장**: Room을 붙여 앱을 껐다 켜도 기록이 남게 하기
- **여러 대화방**: 시스템 프롬프트별로 방을 나누기
