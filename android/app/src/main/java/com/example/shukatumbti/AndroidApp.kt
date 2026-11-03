package com.example.shukatumbti

import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONException
import java.io.IOException
import java.math.BigDecimal
import java.security.GeneralSecurityException

internal enum class Page { LOADING, LOGIN, HOME, PROFILE, DIAGNOSIS, RESULTS, SAVED, DETAIL }

internal class AndroidState : ViewModel() {
    val api = ApiClient()
    lateinit var sessionStore: SessionStore
        private set
    private var initialized = false
    var token by mutableStateOf<String?>(null)
    var email by mutableStateOf<String?>(null)
    var page by mutableStateOf(Page.LOADING)
    var conditions by mutableStateOf<Conditions?>(null)
    var profile by mutableStateOf<StudentProfile?>(null)
    var profileOptions by mutableStateOf<ProfileOptions?>(null)
    var profileMessage by mutableStateOf<String?>(null)
    var questions by mutableStateOf<List<Question>>(emptyList())
    var answers by mutableStateOf<Map<String, Int>>(emptyMap())
    var currentQuestion by mutableIntStateOf(0)
    var result by mutableStateOf<DiagnosisResult?>(null)
    var savedCompanies by mutableStateOf<List<SavedCompany>>(emptyList())
    var detail by mutableStateOf<CompanyDetail?>(null)
    var detailDiagnosisId by mutableStateOf<String?>(null)
    var detailReturnPage by mutableStateOf(Page.RESULTS)
    var saveSuccess by mutableStateOf(false)
    var busy by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)

    fun initialize(store: SessionStore) {
        if (initialized) return
        initialized = true
        sessionStore = store
        viewModelScope.launch {
            try {
                val saved = withContext(Dispatchers.IO) { store.load() }
                if (saved != null) {
                    conditions = api.getConditions(saved.token)
                    token = saved.token
                    email = saved.email
                    page = Page.HOME
                } else page = Page.LOGIN
            } catch (cause: ApiException) {
                if (cause.status == 401) {
                    try {
                        withContext(Dispatchers.IO) { store.clear() }
                    } catch (clearError: IOException) {
                        error = clearError.message
                    }
                } else error = cause.message
                page = Page.LOGIN
            } catch (cause: GeneralSecurityException) {
                try {
                    withContext(Dispatchers.IO) { store.clear() }
                    error = "保存済みセッションを復元できなかったため、ログインし直してください。"
                } catch (clearError: IOException) {
                    error = clearError.message
                }
                page = Page.LOGIN
            } catch (cause: IOException) {
                error = "サーバーまたは保存済みセッションを読み取れませんでした。"
                page = Page.LOGIN
            } catch (cause: JSONException) {
                error = "サーバーの応答を読み取れませんでした。"
                page = Page.LOGIN
            }
        }
    }

    override fun onCleared() {
        api.close()
    }
}

@Composable
internal fun AndroidApp(state: AndroidState) {
    val api = state.api
    val scope = state.viewModelScope
    var token by state::token
    var email by state::email
    var page by state::page
    var conditions by state::conditions
    var profile by state::profile
    var profileOptions by state::profileOptions
    var profileMessage by state::profileMessage
    var questions by state::questions
    var answers by state::answers
    var currentQuestion by state::currentQuestion
    var result by state::result
    var savedCompanies by state::savedCompanies
    var detail by state::detail
    var detailDiagnosisId by state::detailDiagnosisId
    var detailReturnPage by state::detailReturnPage
    var saveSuccess by state::saveSuccess
    var busy by state::busy
    var error by state::error

    fun run(action: suspend () -> Unit) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                action()
            } catch (cause: ApiException) {
                if (cause.status == 401) {
                    try {
                        withContext(Dispatchers.IO) { state.sessionStore.clear() }
                    } catch (clearError: IOException) {
                        error = clearError.message
                    }
                    token = null
                    email = null
                    conditions = null
                    profile = null
                    profileOptions = null
                    profileMessage = null
                    result = null
                    savedCompanies = emptyList()
                    detail = null
                    page = Page.LOGIN
                }
                if (error == null) error = cause.message ?: "リクエストに失敗しました。"
            } catch (cause: IOException) {
                if (BuildConfig.DEBUG) Log.e("AndroidApi", "通信に失敗しました。", cause)
                error = "通信または端末への保存に失敗しました。Web/APIと端末の状態を確認してください。"
            } catch (cause: JSONException) {
                if (BuildConfig.DEBUG) Log.e("AndroidApi", "JSONの解析に失敗しました。", cause)
                error = "サーバーの応答を読み取れませんでした。"
            } catch (cause: GeneralSecurityException) {
                if (BuildConfig.DEBUG) Log.e("AndroidSession", "セッションの暗号化に失敗しました。", cause)
                error = "セッションを安全に保存できませんでした。"
            } finally {
                busy = false
            }
        }
    }

    fun openDetail(companyId: String, diagnosisId: String?, returnPage: Page) {
        val currentToken = token ?: return
        run {
            detail = api.companyDetail(currentToken, companyId, diagnosisId)
            detailDiagnosisId = diagnosisId
            detailReturnPage = returnPage
            saveSuccess = returnPage == Page.SAVED
            page = Page.DETAIL
        }
    }

    fun openProfile() {
        val currentToken = token ?: return
        run {
            val payload = api.getProfile(currentToken)
            profile = payload.profile
            conditions = payload.conditions ?: api.getConditions(currentToken)
            profileOptions = payload.options
            profileMessage = null
            page = Page.PROFILE
        }
    }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).safeDrawingPadding()) {
        if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
        if (error != null) Text(error.orEmpty(), Modifier.fillMaxWidth().padding(16.dp), color = MaterialTheme.colorScheme.error)
        Box(Modifier.weight(1f)) {
            when (page) {
                Page.LOADING -> ScreenColumn {
                    Brand()
                    Spacer(Modifier.height(24.dp))
                    LinearProgressIndicator(Modifier.fillMaxWidth())
                    Text("ログイン状態を確認しています。")
                }
                Page.LOGIN -> LoginScreen(busy) { email, password, register ->
                    run {
                        val newToken = api.authenticate(email, password, register)
                        val newConditions = api.getConditions(newToken)
                        withContext(Dispatchers.IO) { state.sessionStore.save(newToken, email) }
                        conditions = newConditions
                        token = newToken
                        state.email = email
                        page = Page.HOME
                    }
                }
                Page.HOME -> HomeScreen(email, busy, onStart = {
                    run {
                        questions = api.getQuestions()
                        answers = emptyMap()
                        currentQuestion = 0
                        page = Page.DIAGNOSIS
                    }
                }, onLogout = {
                    val currentToken = token
                    if (currentToken != null) run {
                        withContext(Dispatchers.IO) { state.sessionStore.clear() }
                        token = null
                        email = null
                        conditions = null
                        profile = null
                        profileOptions = null
                        profileMessage = null
                        result = null
                        savedCompanies = emptyList()
                        detail = null
                        page = Page.LOGIN
                        api.signOut(currentToken)
                    }
                })
                Page.PROFILE -> profileOptions?.let { options ->
                    ProfileScreen(profile, options, conditions, profileMessage, busy,
                        onSaveProfile = { nextProfile, nextConditions ->
                            val currentToken = token
                            if (currentToken != null) run {
                                api.putProfile(currentToken, nextProfile, nextConditions)
                                profile = nextProfile
                                conditions = nextConditions
                                profileMessage = "プロフィールを保存しました。"
                            }
                        })
                }
                Page.DIAGNOSIS -> DiagnosisScreen(questions, answers, currentQuestion, busy,
                    onAnswer = { id, answer -> answers = answers + (id to answer) },
                    onQuestionChange = { currentQuestion = it },
                    onBack = { page = Page.HOME },
                    onSubmit = {
                        val currentToken = token
                        if (currentToken != null) run {
                            result = api.createDiagnosis(currentToken, answers.toMap())
                            page = Page.RESULTS
                        }
                    })
                Page.RESULTS -> ResultsScreen(result, busy,
                    onRetry = { page = Page.HOME }, onConditions = { openProfile() },
                    onDetail = { companyId -> result?.let { openDetail(companyId, it.diagnosisId, Page.RESULTS) } },
                    onSaved = {
                        val currentToken = token
                        if (currentToken != null) run {
                            savedCompanies = api.savedCompanies(currentToken)
                            page = Page.SAVED
                        }
                    })
                Page.SAVED -> SavedCompaniesScreen(savedCompanies, busy,
                    onDetail = { company -> openDetail(company.id, company.diagnosisId, Page.SAVED) },
                    onBack = { page = Page.RESULTS })
                Page.DETAIL -> detail?.let { company -> CompanyDetailScreen(company, busy, saveSuccess,
                    canSave = detailDiagnosisId != null,
                    onBack = { page = detailReturnPage },
                    onSave = {
                        val currentToken = token
                        val diagnosisId = detailDiagnosisId
                        if (currentToken != null && diagnosisId != null) run {
                            api.saveCompany(currentToken, diagnosisId, company.id)
                            saveSuccess = true
                        }
                    }) }
            }
        }
        if (token != null && page != Page.DIAGNOSIS && page != Page.DETAIL) {
            NavigationBar(containerColor = Cream) {
                listOf(Page.HOME to "ホーム", Page.PROFILE to "プロフィール", Page.RESULTS to "提案企業")
                    .forEach { (destination, label) ->
                        NavigationBarItem(
                            selected = page == destination,
                            enabled = !busy,
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Ink,
                                selectedTextColor = Ink,
                                unselectedIconColor = Ink,
                                unselectedTextColor = Ink,
                                indicatorColor = Color(0xFFFFDED6),
                            ),
                            onClick = {
                                if (destination == Page.RESULTS) {
                                    val currentToken = token
                                    if (currentToken != null) run {
                                        result = api.latestDiagnosis(currentToken)
                                        page = Page.RESULTS
                                    }
                                } else if (destination == Page.PROFILE && page != Page.PROFILE) {
                                    openProfile()
                                } else if (destination != page) page = destination
                            },
                            icon = { Text(if (destination == Page.HOME) "⌂" else if (destination == Page.PROFILE) "人" else "★") },
                            label = { Text(label) },
                        )
                    }
            }
        }
    }
}

@Composable
private fun LoginScreen(busy: Boolean, onSubmit: (String, String, Boolean) -> Unit) {
    var register by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    ScreenColumn {
        Brand()
        Spacer(Modifier.height(20.dp))
        Image(painterResource(R.drawable.character_flower), contentDescription = null,
            modifier = Modifier.fillMaxWidth().height(110.dp))
        Spacer(Modifier.height(32.dp))
        Text(if (register) "新規登録" else "ログイン", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        if (register) {
            Spacer(Modifier.height(12.dp))
            Text("登録には @example.com のメールアドレスを使用してください。")
        }
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(email, { email = it }, label = { Text("メールアドレス") }, singleLine = true,
            readOnly = busy, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(password, { password = it }, label = { Text("パスワード") }, singleLine = true,
            readOnly = busy, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(20.dp))
        Button(onClick = { onSubmit(email.trim(), password, register) }, enabled = !busy && email.isNotBlank() && password.length >= 8,
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
            Text(if (register) "登録して始める" else "ログイン")
        }
        TextButton(onClick = { register = !register }, enabled = !busy) {
            Text(if (register) "アカウントをお持ちの方はログイン" else "初めての方は新規登録")
        }
    }
}

@Composable
private fun HomeScreen(email: String?, busy: Boolean, onStart: () -> Unit, onLogout: () -> Unit) {
    ScreenColumn {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically) {
            Text(email?.let(::abbreviateEmail) ?: "ログイン中", style = MaterialTheme.typography.labelMedium,
                color = Ink, maxLines = 1, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.End,
                modifier = Modifier.weight(1f))
            Spacer(Modifier.width(8.dp))
            OutlinedButton(onClick = onLogout, enabled = !busy) { Text("ログアウト") }
        }
        Spacer(Modifier.height(8.dp))
        Brand()
        Spacer(Modifier.height(16.dp))
        Image(painterResource(R.drawable.character_flower), contentDescription = "笑顔の赤いお花のキャラクター",
            modifier = Modifier.fillMaxWidth().height(190.dp))
        Spacer(Modifier.height(8.dp))
        Text("あなたに合う企業を、見つけよう。", style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(12.dp))
        Text("希望条件と働き方の相性から、企業選びをもっと手軽に。", textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(20.dp))
        Button(onClick = onStart, enabled = !busy, modifier = Modifier.fillMaxWidth().heightIn(min = 62.dp)) {
            Text("診断を始める", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(24.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            StepCard("1", "希望条件を\n入力する", R.drawable.clipboard, Coral, Modifier.weight(1f))
            StepCard("2", "働き方の相性を\n診断する", R.drawable.character_flower, Mint, Modifier.weight(1f))
            StepCard("3", "あなたに合う\n企業を提案", R.drawable.companies, Purple, Modifier.weight(1f))
        }
    }
}

private fun abbreviateEmail(email: String): String {
    val local = email.substringBefore('@')
    return "${local.take(3)}…@${email.substringAfter('@')}"
}

@Composable
private fun StepCard(number: String, label: String, image: Int, color: Color, modifier: Modifier = Modifier) {
    Card(modifier, shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFDF8))) {
        Column(Modifier.fillMaxWidth().padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(Modifier.size(26.dp).background(color, RoundedCornerShape(50)), contentAlignment = Alignment.Center) {
                Text(number, fontWeight = FontWeight.Bold, color = Ink)
            }
            Image(painterResource(image), contentDescription = null, modifier = Modifier.size(68.dp))
            Text(label, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center, color = Ink)
        }
    }
}

@Composable
private fun ProfileScreen(
    profile: StudentProfile?, options: ProfileOptions, conditions: Conditions?,
    message: String?, busy: Boolean,
    onSaveProfile: (StudentProfile, Conditions) -> Unit,
) {
    var graduationYear by rememberSaveable(profile?.graduationYear) {
        mutableStateOf(profile?.graduationYear?.toString().orEmpty())
    }
    var schoolType by rememberSaveable(profile?.schoolType) { mutableStateOf(profile?.schoolType.orEmpty()) }
    var age by rememberSaveable(profile?.age) { mutableStateOf(profile?.age?.toString().orEmpty()) }
    var schoolName by rememberSaveable(profile?.schoolName) { mutableStateOf(profile?.schoolName.orEmpty()) }
    var major by rememberSaveable(profile?.major) { mutableStateOf(profile?.major.orEmpty()) }
    var gender by rememberSaveable(profile?.gender) { mutableStateOf(profile?.gender.orEmpty()) }
    var hobbies by rememberSaveable(profile?.hobbies) { mutableStateOf(profile?.hobbies.orEmpty()) }
    var location by rememberSaveable(conditions?.workLocation) { mutableStateOf(conditions?.workLocation.orEmpty()) }
    var salaryMan by rememberSaveable(conditions?.minimumMonthlySalaryYen) {
        mutableStateOf(conditions?.minimumMonthlySalaryYen?.let {
            BigDecimal(it).movePointLeft(4).stripTrailingZeros().toPlainString()
        }.orEmpty())
    }
    val validSalary = salaryMan.isBlank() || Regex("^\\d{1,4}(\\.\\d{1,4})?$").matches(salaryMan)
    val salaryYen = if (salaryMan.isBlank()) null else if (validSalary) {
        BigDecimal(salaryMan).movePointRight(4).intValueExact()
    } else null
    val validConditions = location in options.prefectures && validSalary &&
        (salaryYen == null || salaryYen <= 10_000_000)
    val year = graduationYear.toIntOrNull()
    val parsedAge = age.toIntOrNull()
    val validProfile = validConditions && year != null && year in 2020..2100 &&
        schoolType in options.schoolTypes && (age.isBlank() || parsedAge != null && parsedAge in 15..100) &&
        schoolName.trim().isNotEmpty() && schoolName.trim().length <= 120 &&
        major.trim().length <= 120 && hobbies.trim().length <= 1000

    ScreenColumn {
        Card(shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = Coral)) {
            Column(Modifier.fillMaxWidth().padding(24.dp)) {
                Text("プロフィール登録", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Black, color = Color.White)
                Spacer(Modifier.height(8.dp))
                Text("希望条件を登録すると、企業の募集条件と照合できます。", color = Color.White)
            }
        }
        Spacer(Modifier.height(18.dp))
        Card(shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFDF8))) {
            Column(Modifier.fillMaxWidth().padding(18.dp)) {
                Text("基本情報", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(graduationYear, { graduationYear = it },
                    label = { Text("卒業予定年（必須）") }, singleLine = true, readOnly = busy,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                OptionPicker("学校種別（必須）", schoolType, options.schoolTypes, busy) { schoolType = it }
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(age, { age = it }, label = { Text("年齢（任意）") }, singleLine = true,
                    readOnly = busy, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(schoolName, { schoolName = it }, label = { Text("学校名（必須）") },
                    singleLine = true, readOnly = busy, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(major, { major = it }, label = { Text("専攻・学んでいる分野（任意）") },
                    singleLine = true, readOnly = busy, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                OptionPicker("性別（任意）", gender, listOf("") + options.genders, busy) { gender = it }
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(hobbies, { hobbies = it }, label = { Text("趣味（任意）") },
                    maxLines = 4, readOnly = busy, modifier = Modifier.fillMaxWidth())
            }
        }
        Spacer(Modifier.height(16.dp))
        Card(shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFDF8))) {
            Column(Modifier.fillMaxWidth().padding(18.dp)) {
                Text("希望条件", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                OptionPicker("希望勤務地（必須）", location, options.prefectures, busy) { location = it }
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(salaryMan, { salaryMan = it },
                    label = { Text("最低月給（万円、任意）") }, singleLine = true, readOnly = busy,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth())
                Text("例：25 と入力すると、25万円以上を希望します。")
            }
        }
        Spacer(Modifier.height(20.dp))
        Button(onClick = {
            val enteredYear = year ?: return@Button
            onSaveProfile(StudentProfile(enteredYear, schoolType, parsedAge,
                schoolName.trim(), major.trim().ifBlank { null }, gender.ifBlank { null },
                hobbies.trim().ifBlank { null }), Conditions(location, salaryYen))
        },
            enabled = !busy && validProfile, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
            Text("プロフィールを保存する")
        }
        if (message != null) Text(message, color = Ink, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun OptionPicker(
    label: String, value: String, options: List<String>, busy: Boolean, onSelect: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Box(Modifier.fillMaxWidth()) {
        OutlinedButton(onClick = { expanded = true }, enabled = !busy,
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
            Text("$label：${value.ifBlank { if (options.contains("")) "回答しない" else "選択してください" }}")
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false },
            modifier = Modifier.heightIn(max = 320.dp)) {
            options.forEach { option ->
                DropdownMenuItem(text = { Text(option.ifBlank { "回答しない" }) },
                    onClick = { onSelect(option); expanded = false })
            }
        }
    }
}

@Composable
private fun DiagnosisScreen(
    questions: List<Question>, answers: Map<String, Int>, current: Int, busy: Boolean,
    onAnswer: (String, Int) -> Unit, onQuestionChange: (Int) -> Unit,
    onBack: () -> Unit, onSubmit: () -> Unit,
) {
    if (questions.isEmpty()) return
    val question = questions[current]
    ScreenColumn {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text("企業MBTI", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black,
                color = Ink, modifier = Modifier.weight(1f))
            Text("質問 ${current + 1} / ${questions.size}", style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold, color = Coral)
        }
        Spacer(Modifier.height(16.dp))
        LinearProgressIndicator(progress = { (current + 1f) / questions.size },
            modifier = Modifier.fillMaxWidth().height(8.dp), color = Coral)
        Spacer(Modifier.height(16.dp))
        Text(question.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(24.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically) {
          question.choices.forEachIndexed { index, _ ->
            val selected = answers[question.id] == index + 1
            val tone = when (index) { 0, 1 -> Purple; 3, 4 -> Mint; else -> Ink.copy(alpha = .45f) }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(if (index == 0 || index == 4) 52.dp else 44.dp)
                    .border(3.dp, tone, CircleShape)
                    .background(if (selected) tone else Color.Transparent, CircleShape)
                    .semantics { contentDescription = "${index + 1}: ${question.choices[index]}" }
                    .clickable(enabled = !busy) { onAnswer(question.id, index + 1) },
                    contentAlignment = Alignment.Center) {
                    if (selected) Text("✓", color = Color.White, fontWeight = FontWeight.Bold)
                }
                Text("${index + 1}", color = Ink, style = MaterialTheme.typography.labelLarge)
            }
          }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(question.choices.first(), modifier = Modifier.weight(1f), color = Purple,
                style = MaterialTheme.typography.labelMedium)
            Spacer(Modifier.width(12.dp))
            Text(question.choices.last(), modifier = Modifier.weight(1f), color = Mint,
                style = MaterialTheme.typography.labelMedium, textAlign = TextAlign.End)
        }
        Spacer(Modifier.height(12.dp))
        Text(answers[question.id]?.let { question.choices[it - 1] } ?: "選択してください",
            modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center,
            style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        Button(onClick = { if (current == questions.lastIndex) onSubmit() else onQuestionChange(current + 1) },
            enabled = !busy && answers.containsKey(question.id), modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
            Text(if (current == questions.lastIndex) "結果を見る" else "次の質問へ")
        }
        TextButton(onClick = { if (current == 0) onBack() else onQuestionChange(current - 1) }, enabled = !busy) {
            Text(if (current == 0) "ホームへ戻る" else "前の質問へ")
        }
    }
}

@Composable
private fun ResultsScreen(
    result: DiagnosisResult?, busy: Boolean, onRetry: () -> Unit, onConditions: () -> Unit,
    onDetail: (String) -> Unit, onSaved: () -> Unit,
) {
    ScreenColumn {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Image(painterResource(R.drawable.character_flower), contentDescription = null,
                modifier = Modifier.size(40.dp))
            Text("企業MBTI", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
            Spacer(Modifier.weight(1f))
            Text("提案結果", style = MaterialTheme.typography.labelLarge)
        }
        Spacer(Modifier.height(20.dp))
        when {
            result == null -> Text("診断結果はまだありません。ホームから診断を始めてください。")
            result.recommendations.isEmpty() -> InfoCard("該当する企業がありません", "希望条件を見直すか、もう一度診断してください。")
            else -> {
                Card(shape = RoundedCornerShape(28.dp),
                    colors = CardDefaults.cardColors(containerColor = Coral)) {
                    Row(Modifier.fillMaxWidth().padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("あなたに合う企業が\n見つかりました\n${result.recommendations.size}社をご提案",
                            modifier = Modifier.weight(1f), color = Color.White,
                            style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                        Image(painterResource(R.drawable.character_flower), contentDescription = null,
                            modifier = Modifier.size(76.dp))
                    }
                }
                Spacer(Modifier.height(18.dp))
                result.recommendations.forEachIndexed { index, item ->
                    Card(shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFDF8))) {
                        Column(Modifier.fillMaxWidth().padding(20.dp)) {
                            Text(item.name, style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Black,
                                color = if (index % 2 == 0) Mint else Purple)
                            Spacer(Modifier.height(12.dp))
                            item.reasons.forEach { reason ->
                                Text("✓  $reason", color = Ink, style = MaterialTheme.typography.bodyLarge)
                                Spacer(Modifier.height(6.dp))
                            }
                            TextButton(onClick = { onDetail(item.id) }, enabled = !busy) { Text("企業詳細を見る") }
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRetry, enabled = !busy, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) { Text("診断をやり直す") }
        TextButton(onClick = onConditions, enabled = !busy) { Text("希望条件を変更する") }
        TextButton(onClick = onSaved, enabled = !busy) { Text("保存した企業を見る") }
    }
}

@Composable
private fun SavedCompaniesScreen(
    companies: List<SavedCompany>, busy: Boolean,
    onDetail: (SavedCompany) -> Unit, onBack: () -> Unit,
) {
    ScreenColumn {
        Text("保存した企業", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(18.dp))
        if (companies.isEmpty()) Text("保存した企業はまだありません。提案結果から企業を保存できます。")
        companies.forEach { company ->
            Card(shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFDF8))) {
                Column(Modifier.fillMaxWidth().padding(20.dp)) {
                    Text(company.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    TextButton(onClick = { onDetail(company) }, enabled = !busy) { Text("企業詳細を見る") }
                }
            }
            Spacer(Modifier.height(12.dp))
        }
        TextButton(onClick = onBack, enabled = !busy) { Text("提案結果へ戻る") }
    }
}

@Composable
private fun CompanyDetailScreen(
    company: CompanyDetail, busy: Boolean, saved: Boolean, canSave: Boolean,
    onBack: () -> Unit, onSave: () -> Unit,
) {
    val context = LocalContext.current
    val detailLabels = listOf(
        "socialDrinks" to "飲み会", "graduatePlacement" to "新卒配属",
        "transferPolicy" to "転勤", "remotePolicy" to "リモート",
        "paidLeave" to "有給", "holidayContact" to "休日連絡",
        "companyEvents" to "社内イベント", "turnoverWithinThreeYears" to "3年以内離職率",
        "graduateGap" to "新卒がギャップを感じやすい点",
    )
    val application = company.applicationUrl?.let(Uri::parse)
        ?.takeIf { it.scheme in listOf("http", "https") && !it.host.isNullOrBlank() }
    ScreenColumn {
        Text("企業詳細", style = MaterialTheme.typography.labelLarge, color = Coral)
        Spacer(Modifier.height(12.dp))
        Text(company.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(12.dp))
        Spacer(Modifier.height(20.dp))
        InfoCard("提案理由", if (company.reasons.isEmpty()) "この保存企業に紐づく診断理由はありません。"
            else company.reasons.joinToString("\n") { "✓  $it" })
        Spacer(Modifier.height(16.dp))
        InfoCard("募集条件", "勤務地：${company.location ?: "未確認"}\n月給：${company.monthlySalaryYen?.let {
            BigDecimal(it).movePointLeft(4).stripTrailingZeros().toPlainString() + "万円"
        } ?: "未確認"}")
        Spacer(Modifier.height(16.dp))
        Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFDF8))) {
            Column(Modifier.fillMaxWidth().padding(24.dp)) {
                Text("働き方・職場", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                detailLabels.forEach { (key, label) ->
                    Text("$label：${company.details[key] ?: "未確認"}")
                    Spacer(Modifier.height(8.dp))
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        InfoCard("情報の出典", "出典URL：${company.sourceUrl ?: "なし"}\n確認日：${company.verifiedAt ?: "なし"}")
        Spacer(Modifier.height(20.dp))
        if (canSave) {
            Button(onClick = onSave, enabled = !busy && !saved, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
                Text(if (saved) "保存済み" else "この企業を保存")
            }
        }
        if (application != null) {
            Button(onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, application)) },
                enabled = !busy, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) { Text("公式応募先を見る") }
        }
        TextButton(onClick = onBack, enabled = !busy) { Text("戻る") }
    }
}

@Composable
private fun Brand() {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
        Text("企業", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Black, color = Ink)
        listOf("M" to Coral, "B" to Mint, "T" to Purple, "I" to Blue).forEach { (letter, color) ->
            Text(letter, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Black, color = color)
        }
    }
}

@Composable
private fun InfoCard(title: String, description: String) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(24.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(description)
        }
    }
}

@Composable
private fun ScreenColumn(content: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())
        .padding(horizontal = 24.dp, vertical = 28.dp)) { content() }
}

@Preview(showBackground = true)
@Composable
private fun HomePreview() {
    ShukatuMbtiTheme { HomeScreen("student@example.com", false, {}, {}) }
}
