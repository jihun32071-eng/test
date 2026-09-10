package com.example.apichatbot.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.apichatbot.data.ApiKeyStore
import com.example.apichatbot.data.ApiMessage
import com.example.apichatbot.data.ChatRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

/** 화면에 그릴 말풍선 하나. */
data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: Role,
    val text: String,
) {
    enum class Role { USER, ASSISTANT }
}

/** 화면 전체의 상태를 한 덩어리로 들고 있습니다. */
data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val systemPrompt: String = DEFAULT_SYSTEM_PROMPT,
    val isSending: Boolean = false,
    val errorMessage: String? = null,
    /** 키가 저장돼 있는지. 없으면 화면이 키 입력창부터 보여 줍니다. */
    val hasApiKey: Boolean = false,
    /** 저장된 키를 가린 형태. 예: `sk-ant-a…7f2a` */
    val maskedApiKey: String = "",
) {
    companion object {
        const val DEFAULT_SYSTEM_PROMPT = "너는 반말하는 고양이 캐릭터야. 짧고 능청스럽게 답해."
    }
}

class ChatViewModel(
    private val repository: ChatRepository = ChatRepository(),
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ChatUiState(hasApiKey = ApiKeyStore.hasKey, maskedApiKey = ApiKeyStore.masked()),
    )
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    /** 설정 화면에서 넣은 키를 저장합니다. 빈 문자열이면 지워집니다. */
    fun saveApiKey(key: String) {
        ApiKeyStore.save(key)
        _uiState.update {
            it.copy(
                hasApiKey = ApiKeyStore.hasKey,
                maskedApiKey = ApiKeyStore.masked(),
                errorMessage = null,
            )
        }
    }

    fun clearApiKey() = saveApiKey("")

    fun updateSystemPrompt(prompt: String) {
        _uiState.update { it.copy(systemPrompt = prompt) }
    }

    /** 시스템 프롬프트를 바꿔 보고 싶을 때 대화를 처음부터 시작합니다. */
    fun clearConversation() {
        _uiState.update { it.copy(messages = emptyList(), errorMessage = null) }
    }

    fun dismissError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    fun send(input: String) {
        val text = input.trim()
        if (text.isEmpty() || _uiState.value.isSending) return

        val userMessage = ChatMessage(role = ChatMessage.Role.USER, text = text)
        _uiState.update {
            it.copy(
                messages = it.messages + userMessage,
                isSending = true,
                errorMessage = null,
            )
        }

        viewModelScope.launch {
            val state = _uiState.value
            val history = state.messages.map { message ->
                ApiMessage(
                    role = if (message.role == ChatMessage.Role.USER) "user" else "assistant",
                    content = message.text,
                )
            }

            val result = repository.send(history = history, systemPrompt = state.systemPrompt)

            result.fold(
                onSuccess = { reply ->
                    _uiState.update {
                        it.copy(
                            messages = it.messages + ChatMessage(
                                role = ChatMessage.Role.ASSISTANT,
                                text = reply,
                            ),
                            isSending = false,
                        )
                    }
                },
                onFailure = { error ->
                    // 실패하면 방금 보낸 내 메시지를 남겨 두고 에러만 알려 줍니다.
                    _uiState.update {
                        it.copy(
                            isSending = false,
                            errorMessage = error.message ?: "요청에 실패했어요.",
                        )
                    }
                },
            )
        }
    }
}
