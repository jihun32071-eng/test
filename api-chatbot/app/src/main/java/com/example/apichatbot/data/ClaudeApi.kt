package com.example.apichatbot.data

import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Retrofit 인터페이스. 함수 하나가 API 엔드포인트 하나에 대응합니다.
 * suspend 함수라서 코루틴 안에서 부르면 알아서 백그라운드 스레드로 나갑니다.
 */
interface ClaudeApi {

    @POST("v1/messages")
    suspend fun sendMessage(@Body request: MessageRequest): MessageResponse
}
