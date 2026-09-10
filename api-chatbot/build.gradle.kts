// 최상위 빌드 파일. 여기서는 플러그인을 "선언만" 하고, 실제 적용은 app/build.gradle.kts 에서 합니다.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}
