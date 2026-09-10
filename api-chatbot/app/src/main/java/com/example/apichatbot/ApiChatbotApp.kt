package com.example.apichatbot

import android.app.Application
import com.example.apichatbot.data.ApiKeyStore

/** 앱이 켜질 때 가장 먼저 실행됩니다. 저장해 둔 API 키를 여기서 읽어 옵니다. */
class ApiChatbotApp : Application() {
    override fun onCreate() {
        super.onCreate()
        ApiKeyStore.init(this)
    }
}
