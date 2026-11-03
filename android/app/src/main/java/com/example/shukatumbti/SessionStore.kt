package com.example.shukatumbti

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.io.IOException
import java.security.GeneralSecurityException
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

internal class SessionStore(context: Context) {
    private val preferences = context.getSharedPreferences("android_session", Context.MODE_PRIVATE)
    private val alias = "shukatu_mbti_session_v1"

    data class StoredSession(val token: String, val email: String?)

    fun save(token: String, email: String) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key(create = true))
        val payload = "$token\n$email"
        val encoded = "${base64(cipher.iv)}:${base64(cipher.doFinal(payload.toByteArray(Charsets.UTF_8)))}"
        if (!preferences.edit().putString("token", encoded).commit()) {
            throw IOException("セッションを保存できませんでした。")
        }
    }

    fun load(): StoredSession? {
        val encoded = preferences.getString("token", null) ?: return null
        val parts = encoded.split(':')
        if (parts.size != 2) throw GeneralSecurityException("保存セッションの形式が正しくありません。")
        val iv: ByteArray
        val ciphertext: ByteArray
        try {
            iv = Base64.decode(parts[0], Base64.NO_WRAP)
            ciphertext = Base64.decode(parts[1], Base64.NO_WRAP)
        } catch (cause: IllegalArgumentException) {
            throw GeneralSecurityException("保存セッションを読み取れません。", cause)
        }
        if (iv.size != 12) throw GeneralSecurityException("保存セッションのIVが正しくありません。")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key(create = false), GCMParameterSpec(128, iv))
        val payload = String(cipher.doFinal(ciphertext), Charsets.UTF_8).split('\n', limit = 2)
        return StoredSession(payload[0], payload.getOrNull(1))
    }

    fun clear() {
        if (!preferences.edit().remove("token").commit()) {
            throw IOException("セッションを削除できませんでした。")
        }
    }

    private fun key(create: Boolean): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = store.getKey(alias, null)
        if (existing is SecretKey) return existing
        if (!create) throw GeneralSecurityException("保存セッションの鍵がありません。")
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(KeyGenParameterSpec.Builder(alias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build())
        return generator.generateKey()
    }

    private fun base64(bytes: ByteArray): String = Base64.encodeToString(bytes, Base64.NO_WRAP)
}
