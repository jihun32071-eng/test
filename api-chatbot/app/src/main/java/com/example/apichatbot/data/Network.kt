package com.example.apichatbot.data

import com.example.apichatbot.BuildConfig
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

/**
 * Retrofit 과 OkHttp 를 조립하는 곳입니다.
 * 앱 전체에서 하나만 쓰면 되므로 object 로 만들어 둡니다.
 */
object Network {

    private const val BASE_URL = "https://api.anthropic.com/"

    /** API 버전 헤더. Anthropic 이 정해 둔 고정 값입니다. */
    private const val ANTHROPIC_VERSION = "2023-06-01"

    /** 모르는 필드가 응답에 섞여 와도 앱이 죽지 않도록 무시하게 설정합니다. */
    val json: Json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        explicitNulls = false
    }

    private val logging = HttpLoggingInterceptor().apply {
        // 릴리스 빌드에서는 로그를 끕니다. 요청 본문에 대화 내용이 들어가니까요.
        level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
        // 디버그 로그에도 키는 남기지 않습니다.
        redactHeader("x-api-key")
    }

    /**
     * 모든 요청에 인증/버전 헤더를 자동으로 붙여 주는 인터셉터입니다.
     * 키는 요청을 보내는 순간 읽습니다 — 설정에서 키를 바꾸면 다음 요청부터 바로 적용돼요.
     */
    private val headerInterceptor = okhttp3.Interceptor { chain ->
        val request = chain.request().newBuilder()
            .addHeader("x-api-key", ApiKeyStore.key)
            .addHeader("anthropic-version", ANTHROPIC_VERSION)
            .addHeader("content-type", "application/json")
            .build()
        chain.proceed(request)
    }

    private val client: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(headerInterceptor)
        .addInterceptor(logging)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)   // 긴 답변은 시간이 걸립니다.
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    val claudeApi: ClaudeApi = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(ClaudeApi::class.java)
}
