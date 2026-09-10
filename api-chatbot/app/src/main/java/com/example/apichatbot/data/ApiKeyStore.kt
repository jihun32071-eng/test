package com.example.apichatbot.data

import android.content.Context
import android.content.SharedPreferences
import com.example.apichatbot.BuildConfig

/**
 * API 키를 폰 안에 보관하는 곳입니다.
 *
 * 사이트에서 받아 설치하는 APK 에는 키를 넣어 둘 수 없습니다 — 넣어 두면
 * 받은 사람 누구나 그 키로 요청을 보낼 수 있으니까요. 그래서 앱을 처음 켰을 때
 * 사용자가 자기 키를 직접 넣고, 그 값을 이 앱만 읽을 수 있는 저장소에 둡니다.
 *
 * Android Studio 로 직접 빌드하는 경우에는 `local.properties` 의
 * ANTHROPIC_API_KEY 가 기본값으로 들어와서, 예전처럼 입력 없이 바로 쓸 수 있어요.
 */
object ApiKeyStore {

    private const val PREFS_NAME = "api_chatbot"
    private const val PREF_KEY = "anthropic_api_key"

    private var prefs: SharedPreferences? = null

    /** 요청을 보낼 때마다 읽히는 값이라 메모리에 들고 있습니다. */
    @Volatile
    private var cached: String = ""

    /** 앱이 켜질 때 Application 에서 한 번 부릅니다. */
    fun init(context: Context) {
        val store = context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs = store
        // 저장해 둔 키가 없으면 빌드에 박힌 키(local.properties)를 씁니다.
        cached = store.getString(PREF_KEY, null)?.takeIf { it.isNotBlank() }
            ?: BuildConfig.ANTHROPIC_API_KEY
    }

    val key: String
        get() = cached

    val hasKey: Boolean
        get() = cached.isNotBlank()

    fun save(value: String) {
        val trimmed = value.trim()
        cached = trimmed
        prefs?.edit()?.apply {
            if (trimmed.isEmpty()) remove(PREF_KEY) else putString(PREF_KEY, trimmed)
        }?.apply()
    }

    fun clear() = save("")

    /**
     * 화면에 보여줄 때 쓰는 가린 형태입니다. 키 전체를 다시 보여줄 일은 없어요.
     * 예: `sk-ant-api03…7f2a`
     */
    fun masked(): String {
        val k = cached
        if (k.isBlank()) return ""
        if (k.length <= 12) return "•".repeat(k.length)
        return k.take(8) + "…" + k.takeLast(4)
    }
}
