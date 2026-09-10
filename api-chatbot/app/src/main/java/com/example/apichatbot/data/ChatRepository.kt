package com.example.apichatbot.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException

/**
 * 화면(ViewModel)과 네트워크 사이를 잇는 층입니다.
 * ViewModel 은 "이 대화를 보내 줘"라고만 말하고, HTTP 사정은 여기서 처리합니다.
 */
class ChatRepository(
    private val api: ClaudeApi = Network.claudeApi,
) {

    /**
     * 지금까지의 대화 전체를 보내고 새 답변 하나를 받아 옵니다.
     * API 는 이전 대화를 기억하지 않기 때문에, 매번 전체 기록을 함께 보내야 문맥이 이어집니다.
     */
    suspend fun send(
        history: List<ApiMessage>,
        systemPrompt: String,
        model: String = DEFAULT_MODEL,
        maxTokens: Int = DEFAULT_MAX_TOKENS,
    ): Result<String> = withContext(Dispatchers.IO) {
        if (!ApiKeyStore.hasKey) {
            return@withContext Result.failure(
                ChatException("API 키가 없어요. 위쪽 열쇠 아이콘을 눌러 키를 넣어 주세요.")
            )
        }

        try {
            val response = api.sendMessage(
                MessageRequest(
                    model = model,
                    maxTokens = maxTokens,
                    system = systemPrompt.ifBlank { null },
                    messages = history,
                )
            )
            val text = response.text()
            if (text.isEmpty()) {
                Result.failure(ChatException("답변이 비어 있어요. 다시 시도해 주세요."))
            } else {
                Result.success(text)
            }
        } catch (e: HttpException) {
            Result.failure(ChatException(e.toFriendlyMessage()))
        } catch (e: IOException) {
            Result.failure(ChatException("인터넷 연결을 확인해 주세요."))
        } catch (e: Exception) {
            Result.failure(ChatException("알 수 없는 오류가 났어요: ${e.message ?: e::class.simpleName}"))
        }
    }

    /** 서버가 보낸 에러 본문을 읽어 사람이 알아볼 수 있는 문장으로 바꿉니다. */
    private fun HttpException.toFriendlyMessage(): String {
        val body = runCatching { response()?.errorBody()?.string() }.getOrNull()
        val parsed = body?.let {
            runCatching { Network.json.decodeFromString(ApiErrorResponse.serializer(), it) }.getOrNull()
        }
        val detail = parsed?.error?.message

        return when (code()) {
            401 -> "API 키가 올바르지 않아요. 콘솔에서 키를 다시 확인해 주세요."
            403 -> "이 키로는 접근할 수 없는 요청이에요."
            404 -> "모델 이름이 맞는지 확인해 주세요. (현재: $DEFAULT_MODEL)"
            429 -> "요청이 너무 잦아요. 잠시 뒤에 다시 시도해 주세요."
            in 500..599 -> "서버가 잠시 불안정해요. 잠시 뒤에 다시 시도해 주세요."
            else -> detail ?: "요청이 실패했어요. (HTTP ${code()})"
        }
    }

    companion object {
        /** 콘솔의 모델 목록에서 원하는 이름으로 바꿔 쓰면 됩니다. */
        const val DEFAULT_MODEL = "claude-sonnet-4-5"
        const val DEFAULT_MAX_TOKENS = 1024
    }
}

class ChatException(message: String) : Exception(message)
