package com.example.shukatumbti

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

internal val Cream = Color(0xFFFFF8EE)
internal val Ink = Color(0xFF252522)
internal val Coral = Color(0xFFFA6C56)
internal val Mint = Color(0xFF6BCBAE)
internal val Purple = Color(0xFF9B88E2)
internal val Blue = Color(0xFF328BDA)
internal val Yellow = Color(0xFFFFB52B)

private val appColors = lightColorScheme(
    primary = Coral,
    onPrimary = Color.White,
    background = Cream,
    onBackground = Ink,
    surface = Color.White,
    onSurface = Ink,
)

@Composable
internal fun ShukatuMbtiTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = appColors, content = content)
}
