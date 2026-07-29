@AGENTS.md — Глобальные инструкции: `D:\ANDROID_WORK\AGENTS.md`

# Название приложения: **120/80 BP Tracker**

**ВАЖНО: Название приложения ("120/80 BP Tracker") МЕНЯТЬ НЕЛЬЗЯ. Это финальное название, зафиксированное для релиза.**

- `app.json` → `expo.name`: `"120/80 BP Tracker"`
- `strings.xml` → `app_name`: `"120/80 BP Tracker"`

---

# РЕГЛАМЕНТ ЭКОНОМИИ ТОКЕНОВ И КАЧЕСТВА РАБОТЫ (КРИТИЧЕСКИ ВАЖНО)

1. **Лаконичный стиль и экономия токенов**:
   - Запрещены эмодзи, лирические отступления, ложные обещания («победа», «100% фикс») и вода.
   - Ответы должны быть строгими, точными и минимальными по объему.
   - Запрещено дублировать неизменённые фрагменты кода или длинные стектрейсы в чат.

2. **Запрет слепых сборок и проверка логов**:
   - Каждая сборка должна предваряться аргументированным анализом. Запрещено повторно триггерить сборки без вычитывания конкретных ошибок в логах.
   - Запрещено объявлять о решении проблемы до подтверждения успешного запуска в рантайме.

3. **Автоматизация параметров окружения и сборок**:
   - При сборке Android **обязательно** задавать обе переменные SDK во избежание конфликта:
     `$env:ANDROID_HOME="D:\ANDROID_WORK\SDK"; $env:ANDROID_SDK_ROOT="D:\ANDROID_WORK\SDK"`
   - При любой сборке iOS (Codemagic) **обязательно** автоматически повышать `buildNumber` в `app.json` перед коммитом и запуском.
   - Автоматически запускать скрипт финализации после успешных сборок Android без лишних вопросов.

4. **Распределение моделей по типам задач**:
   - **Старшие модели (Pro / Opus)**: Для архитектуры, проектирования, отладки сложных конфликтов библиотек и глубокого анализа ошибок.
   - **Младшие модели (Flash / Lite)**: Для сбора логов, вызова готовых PowerShell-скриптов, рутинного мониторинга задач и точечных правок.

5. **Локальная предпроверка (Zero-Guess)**:
   - Перед коммитом и отправкой кода на CI (Codemagic) выполнять предварительную проверку валидности конфига Expo (`npx expo config --type public`) для исключения заведомо поломанных сборок.

6. **Жесткий маппинг команд (Command Mapping)**:
   - Использовать строго зафиксированные команды для рутины. Не изобретать скрипты на лету.

7. **Строгий формат ответа**:
   - При рутинных операциях (сборка, мелкие фиксы) отвечать СТРОГО в 3 строки:
     `[ДЕЙСТВИЕ]:` <макс 5 слов>
     `[КОМАНДА]:` <код/скрипт>
     `[ПРОВЕРКА]:` <что проверить>
   - Запрещены слова: "Я думаю", "Возможно", "Вероятно", "Предлагаю", "Давайте", а также извинения. Максимум 1 предложение на объяснение.

8. **ИСТОРИЯ ОШИБОК (Error History)**:
   - После краша или падения сборки, агент ОБЯЗАН записать ошибку в `D:\projects\120_80_BP_Treter\crash_history.md`.
   - Перед решением читать этот файл, чтобы не повторять гипотезы.
---

# Environment: ANDROID_WORK

## Переменные окружения:

```powershell
$env:JAVA_HOME="D:\tools\AndroidStudio\jbr"
$env:ANDROID_HOME="D:\ANDROID_WORK\SDK"
$env:ANDROID_SDK_ROOT="D:\ANDROID_WORK\SDK"
$env:TMP="D:\ANDROID_WORK\tmp"
$env:TEMP="D:\ANDROID_WORK\tmp"
```

---

# ИНСТРУКЦИЯ ПО АВТОМАТИЧЕСКОМУ ФИНАЛИЗИРОВАНИЮ (ANDROID)

После завершения **любой** успешной сборки (AAB или APK), выполни этот PowerShell-скрипт:

## Целевая папка
`D:\projects\120_80_BP_Treter\120_80_dev_drafts\KEY GOOGLE PM\`

## Полный скрипт финализации (выполнять автоматически):

```powershell
$Root = "D:\projects\120_80_BP_Treter"
$DestDir = "$Root\120_80_dev_drafts\KEY GOOGLE PM\"
if (-not (Test-Path $DestDir)) { New-Item -ItemType Directory -Path $DestDir -Force }
Get-ChildItem -Path "$Root\android\app\build\outputs\bundle\release\*.aab" -ErrorAction SilentlyContinue | Copy-Item -Destination (Join-Path $DestDir "app-release.aab") -Force
Get-ChildItem -Path "$Root\android\app\build\outputs\apk\release\*.apk" -ErrorAction SilentlyContinue | Copy-Item -Destination (Join-Path $DestDir "app-release.apk") -Force
Get-ChildItem -Path "$Root\android\app\*.jks", "$Root\android\app\*.keystore" -ErrorAction SilentlyContinue | Select-Object -First 1 | Copy-Item -Destination (Join-Path $DestDir "release-key.jks") -Force
```

---

# Политика безопасности: key_passwords.txt

После каждой успешной сборки Android — создавай/обновляй `key_passwords.txt` в папке `KEY GOOGLE PM\`.

## Алгоритм действий:
1. Проверить/обновить `key_passwords.txt` актуальными данными.
2. Вывести факт создания без воды.

---

# Сборка AAB (для Google Play)

## Команда:
```powershell
$env:JAVA_HOME="D:\tools\AndroidStudio\jbr"; $env:ANDROID_HOME="D:\ANDROID_WORK\SDK"; $env:ANDROID_SDK_ROOT="D:\ANDROID_WORK\SDK"; $env:TMP="D:\ANDROID_WORK\tmp"; $env:TEMP="D:\ANDROID_WORK\tmp"; .\gradlew.bat bundleRelease
```
Рабочая директория: `D:\projects\120_80_BP_Treter\android`

---

# Сборка APK (для тестов)

## Команда:
```powershell
$env:JAVA_HOME="D:\tools\AndroidStudio\jbr"; $env:ANDROID_HOME="D:\ANDROID_WORK\SDK"; $env:ANDROID_SDK_ROOT="D:\ANDROID_WORK\SDK"; $env:TMP="D:\ANDROID_WORK\tmp"; $env:TEMP="D:\ANDROID_WORK\tmp"; .\gradlew.bat assembleRelease
```
Рабочая директория: `D:\projects\120_80_BP_Treter\android`

---

# Сборка iOS и TestFlight (Codemagic)

При команде "Сборка на iOS", "TestFlight" и аналогичных:
1. Автоматически повысить `buildNumber` в `app.json`.
2. Закоммитить и запушить в `master` (`git add .`, `git commit -m "..."`, `git push origin master`).
3. Запустить сборку через API Codemagic (токен из `D:\projects\global_keys.txt`).
4. Контролировать статус выполнения. При падении анализировать логи и исправлять ошибку автономно.
