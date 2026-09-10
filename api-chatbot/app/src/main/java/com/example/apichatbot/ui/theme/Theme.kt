package com.example.apichatbot.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// 소개 페이지와 같은 색을 씁니다: 청록(teal)과 황토(gold).
private val Teal = Color(0xFF1D6B67)
private val TealLight = Color(0xFF5CBDB5)
private val Gold = Color(0xFFA9781A)
private val GoldLight = Color(0xFFDFAC48)

private val LightColors = lightColorScheme(
    primary = Teal,
    onPrimary = Color(0xFFFBFDFD),
    secondary = Gold,
    onSecondary = Color(0xFFFFFBF2),
    background = Color(0xFFF4F5F8),
    onBackground = Color(0xFF1A1C22),
    surface = Color(0xFFFCFCFD),
    onSurface = Color(0xFF1A1C22),
    surfaceVariant = Color(0xFFE7E9ED),
    onSurfaceVariant = Color(0xFF3C404C),
)

private val DarkColors = darkColorScheme(
    primary = TealLight,
    onPrimary = Color(0xFF0F1F1E),
    secondary = GoldLight,
    onSecondary = Color(0xFF251B06),
    background = Color(0xFF131519),
    onBackground = Color(0xFFE7E9EF),
    surface = Color(0xFF1C1F26),
    onSurface = Color(0xFFE7E9EF),
    surfaceVariant = Color(0xFF23262F),
    onSurfaceVariant = Color(0xFFC6CAD5),
)

@Composable
fun ApiChatbotTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content,
    )
}
