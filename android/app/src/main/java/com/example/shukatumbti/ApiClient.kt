package com.example.shukatumbti

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.request.header
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.contentType
import org.json.JSONException
import org.json.JSONObject

internal data class Question(val id: String, val title: String, val choices: List<String>)
internal data class Conditions(val workLocation: String, val minimumMonthlySalaryYen: Int?)
internal data class StudentProfile(
    val graduationYear: Int, val schoolType: String, val age: Int?, val schoolName: String,
    val major: String?, val gender: String?, val hobbies: String?,
)
internal data class ProfileOptions(
    val prefectures: List<String>, val schoolTypes: List<String>, val genders: List<String>,
)
internal data class ProfilePayload(val profile: StudentProfile?, val conditions: Conditions?, val options: ProfileOptions)
internal data class Recommendation(val id: String, val name: String, val difference: Int, val reasons: List<String>)
internal data class DiagnosisResult(val diagnosisId: String, val recommendations: List<Recommendation>)
internal data class SavedCompany(val id: String, val name: String, val diagnosisId: String?)
internal data class CompanyDetail(
    val id: String, val name: String, val location: String?, val monthlySalaryYen: Int?,
    val difference: Int?, val reasons: List<String>, val details: Map<String, String?>,
    val sourceUrl: String?, val verifiedAt: String?, val applicationUrl: String?,
)

internal class ApiException(val status: Int, message: String) : Exception(message)

internal class ApiClient {
    private val baseUrl = BuildConfig.API_BASE_URL.ifBlank {
        error("API_BASE_URL を設定してください。")
    }
    private val client = HttpClient(CIO) { expectSuccess = false }

    fun close() = client.close()

    private suspend fun call(
        path: String,
        method: HttpMethod = HttpMethod.Get,
        token: String? = null,
        body: JSONObject? = null,
    ): Pair<JSONObject, HttpResponse> {
        val response = client.request("$baseUrl$path") {
            this.method = method
            if (token != null) header(HttpHeaders.Authorization, "Bearer $token")
            if (body != null) {
                contentType(ContentType.Application.Json)
                setBody(body.toString())
            }
        }
        val result = JSONObject(response.bodyAsText())
        if (response.status.value !in 200..299) {
            val message = result.optString("error").ifBlank { result.optString("message", "リクエストに失敗しました。") }
            throw ApiException(response.status.value, message)
        }
        return result to response
    }

    suspend fun authenticate(email: String, password: String, register: Boolean): String {
        val path = if (register) "/api/auth/sign-up/email" else "/api/auth/sign-in/email"
        val body = JSONObject().put("email", email).put("password", password)
        if (register) body.put("name", "学生")
        val (_, response) = call(path, HttpMethod.Post, body = body)
        return response.headers["set-auth-token"] ?: error("認証トークンが返されませんでした。")
    }

    suspend fun signOut(token: String) {
        call("/api/auth/sign-out", HttpMethod.Post, token, JSONObject())
    }

    suspend fun getConditions(token: String): Conditions? {
        val response = call("/api/v1/conditions", token = token).first
        if (!response.has("conditions")) throw JSONException("conditions がありません。")
        if (response.isNull("conditions")) return null
        val value = response.getJSONObject("conditions")
        return Conditions(
            value.getString("workLocation"),
            if (value.isNull("minimumMonthlySalaryYen")) null else value.getInt("minimumMonthlySalaryYen"),
        )
    }

    suspend fun putConditions(token: String, conditions: Conditions) {
        val body = JSONObject()
            .put("workLocation", conditions.workLocation)
            .put("minimumMonthlySalaryYen", conditions.minimumMonthlySalaryYen ?: JSONObject.NULL)
        call("/api/v1/conditions", HttpMethod.Put, token, body)
    }

    suspend fun getProfile(token: String): ProfilePayload {
        val response = call("/api/v1/profile", token = token).first
        val options = response.getJSONObject("options")
        fun strings(key: String): List<String> {
            val items = options.getJSONArray(key)
            return (0 until items.length()).map(items::getString)
        }
        val profileValue = if (response.isNull("profile")) null else response.getJSONObject("profile")
        val profile = profileValue?.let { value ->
            StudentProfile(
                value.getInt("graduationYear"), value.getString("schoolType"),
                if (value.isNull("age")) null else value.getInt("age"), value.getString("schoolName"),
                value.nullableString("major"), value.nullableString("gender"),
                value.nullableString("hobbies"),
            )
        }
        val conditions = profileValue?.let { value ->
            Conditions(
                value.getString("workLocation"),
                if (value.isNull("minimumMonthlySalaryYen")) null else value.getInt("minimumMonthlySalaryYen"),
            )
        }
        return ProfilePayload(profile, conditions, ProfileOptions(strings("prefectures"), strings("schoolTypes"), strings("genders")))
    }

    suspend fun putProfile(token: String, profile: StudentProfile, conditions: Conditions) {
        val body = JSONObject()
            .put("graduationYear", profile.graduationYear)
            .put("schoolType", profile.schoolType)
            .put("age", profile.age ?: JSONObject.NULL)
            .put("schoolName", profile.schoolName)
            .put("major", profile.major ?: JSONObject.NULL)
            .put("gender", profile.gender ?: JSONObject.NULL)
            .put("hobbies", profile.hobbies ?: JSONObject.NULL)
            .put("workLocation", conditions.workLocation)
            .put("minimumMonthlySalaryYen", conditions.minimumMonthlySalaryYen ?: JSONObject.NULL)
        call("/api/v1/profile", HttpMethod.Put, token, body)
    }

    suspend fun getQuestions(): List<Question> {
        val items = call("/api/v1/questions").first.getJSONArray("questions")
        return (0 until items.length()).map { index ->
            val item = items.getJSONObject(index)
            val choices = item.getJSONArray("choices")
            Question(item.getString("id"), item.getString("title"), (0 until choices.length()).map(choices::getString))
        }
    }

    suspend fun createDiagnosis(token: String, answers: Map<String, Int>): DiagnosisResult {
        val body = JSONObject().put("answers", JSONObject(answers))
        return diagnosis(call("/api/v1/diagnoses", HttpMethod.Post, token, body).first)
    }

    suspend fun latestDiagnosis(token: String): DiagnosisResult? {
        val response = call("/api/v1/diagnoses/latest", token = token).first
        if (!response.has("diagnosis")) throw JSONException("diagnosis がありません。")
        if (response.isNull("diagnosis")) return null
        val value = response.getJSONObject("diagnosis")
        return diagnosis(value)
    }

    suspend fun companyDetail(token: String, companyId: String, diagnosisId: String?): CompanyDetail {
        val path = if (diagnosisId == null) "/api/v1/saved-companies/$companyId"
            else "/api/v1/diagnoses/$diagnosisId/companies/$companyId"
        val value = call(path, token = token).first.getJSONObject("company")
        val details = value.getJSONObject("details")
        val detailKeys = listOf("socialDrinks", "graduatePlacement", "transferPolicy", "remotePolicy",
            "paidLeave", "holidayContact", "companyEvents", "turnoverWithinThreeYears", "graduateGap")
        val reasons = value.getJSONArray("reasons")
        return CompanyDetail(
            value.getString("id"), value.getString("name"), value.nullableString("location"),
            if (value.isNull("monthlySalaryYen")) null else value.getInt("monthlySalaryYen"),
            if (value.isNull("difference")) null else value.getInt("difference"),
            (0 until reasons.length()).map(reasons::getString),
            detailKeys.associateWith { details.nullableString(it) },
            value.nullableString("sourceUrl"), value.nullableString("verifiedAt"),
            value.nullableString("applicationUrl"),
        )
    }

    suspend fun savedCompanies(token: String): List<SavedCompany> {
        val items = call("/api/v1/saved-companies", token = token).first.getJSONArray("companies")
        return (0 until items.length()).map { index ->
            val item = items.getJSONObject(index)
            SavedCompany(item.getString("id"), item.getString("name"), item.nullableString("diagnosisId"))
        }
    }

    suspend fun saveCompany(token: String, diagnosisId: String, companyId: String) {
        val body = JSONObject().put("diagnosisId", diagnosisId).put("companyId", companyId)
        call("/api/v1/saved-companies", HttpMethod.Post, token, body)
    }

    private fun JSONObject.nullableString(key: String): String? {
        if (!has(key)) throw JSONException("$key がありません。")
        return if (isNull(key)) null else getString(key)
    }

    private fun diagnosis(value: JSONObject): DiagnosisResult {
        val items = value.getJSONArray("recommendations")
        val recommendations = (0 until items.length()).map { index ->
            val item = items.getJSONObject(index)
            val reasons = item.getJSONArray("reasons")
            Recommendation(
                item.getString("id"), item.getString("name"), item.getInt("difference"),
                (0 until reasons.length()).map(reasons::getString),
            )
        }
        return DiagnosisResult(value.getString("diagnosisId"), recommendations)
    }
}
