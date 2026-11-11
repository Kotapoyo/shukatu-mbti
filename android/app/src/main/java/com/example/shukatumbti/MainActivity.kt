package com.example.shukatumbti

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.ViewModelProvider

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val state = ViewModelProvider(this)[AndroidState::class.java]
        state.initialize(SessionStore(applicationContext))
        setContent {
            ShukatuMbtiTheme { AndroidApp(state) }
        }
    }
}
