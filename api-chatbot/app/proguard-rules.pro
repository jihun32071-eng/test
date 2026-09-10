# kotlinx.serialization 이 쓰는 직렬화 클래스가 난독화로 사라지지 않게 지켜 줍니다.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**

-keepclassmembers class com.example.apichatbot.data.** {
    *** Companion;
}
-keepclasseswithmembers class com.example.apichatbot.data.** {
    kotlinx.serialization.KSerializer serializer(...);
}
