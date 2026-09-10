package com.example.apichatbot.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Anthropic Messages API 로 주고받는 JSON 의 모양을 그대로 옮긴 데이터 클래스들입니다.
 *
 * 보내는 JSON 예시:
 * {
 *   "model": "claude-sonnet-4-5",
 *   "max_tokens": 1024,
 *   "system": "너는 반말하는 고양이 캐릭터야",
 *   "messages": [ { "role": "user", "content": "오늘 뭐 하지?" } ]
 * }
 */
@Serializable
data class MessageRequest(
    val model: String,
    @SerialName("max_tokens") val maxTokens: Int,
    val system: String? = null,
    val messages: List<ApiMessage>,
)

/** role 은 "user" 또는 "assistant" 두 가지만 씁니다. */
@Serializable
data class ApiMessage(
    val role: String,
    val content: String,
)

@Serializable
data class MessageResponse(
    val id: String,
    val role: String,
    val model: String,
    val content: List<ContentBlock>,
    @SerialName("stop_reason") val stopReason: String? = null,
    val usage: Usage? = null,
) {
    /** 응답은 블록 목록으로 오기 때문에, 텍스트 블록만 이어 붙여 한 문장으로 만듭니다. */
    fun text(): String = content
        .filter { it.type == "text" }
        .mapNotNull { it.text }
        .joinToString("")
        .trim()
}

@Serializable
data class ContentBlock(
    val type: String,
    val text: String? = null,
)

@Serializable
data class Usage(
    @SerialName("input_tokens") val inputTokens: Int = 0,
    @SerialName("output_tokens") val outputTokens: Int = 0,
)

/** 400/401/429 같은 실패 응답의 본문 모양입니다. */
@Serializable
data class ApiErrorResponse(
    val type: String? = null,
    val error: ApiErrorBody? = null,
)

@Serializable
data class ApiErrorBody(
    val type: String? = null,
    val message: String? = null,
)
