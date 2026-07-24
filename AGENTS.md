@AGENTS.md — Глобальные инструкции: `D:\ANDROID_WORK\AGENTS.md`

# Название приложения: **120/80 BP Tracker**

**ВАЖНО: Название приложения ("120/80 BP Tracker") МЕНЯТЬ НЕЛЬЗЯ. Это финальное название, зафиксированное для релиза.**

- `app.json` → `expo.name`: `"120/80 BP Tracker"`
- `strings.xml` → `app_name`: `"120/80 BP Tracker"`

---

# Environment: ANDROID_WORK

## Переменные окружения:

```powershell
$env:JAVA_HOME="D:\tools\AndroidStudio\jbr"
$env:ANDROID_HOME="D:\ANDROID_WORK\SDK"
$env:TMP="D:\ANDROID_WORK\tmp"
$env:TEMP="D:\ANDROID_WORK\tmp"
```

---

# ИНСТРУКЦИЯ ПО АВТОМАТИЧЕСКОМУ ФИНАЛИЗИРОВАНИЮ

После завершения **любой** успешной сборки (AAB или APK), выполни этот PowerShell-скрипт:

## Целевая папка
`D:\ANDROID_WORK\PROJECTS\120_80_BP_Treter\120_80_dev_drafts\KEY GOOGLE PM\`

## Полный скрипт финализации (выполнять автоматически, без вопросов):

```powershell
$Root = "D:\ANDROID_WORK"
$DestDir = "$Root\PROJECTS\120_80_BP_Treter\120_80_dev_drafts\KEY GOOGLE PM\"
# Копируем AAB
Get-ChildItem -Path "$Root\PROJECTS\120_80_BP_Treter\android\app\build\outputs\bundle\release\*.aab" | Copy-Item -Destination (Join-Path $DestDir "app-release.aab") -Force
# Копируем APK
Get-ChildItem -Path "$Root\PROJECTS\120_80_BP_Treter\android\app\build\outputs\apk\release\*.apk" | Copy-Item -Destination (Join-Path $DestDir "app-release.apk") -Force
# Копируем ключ подписи
Get-ChildItem -Path "$Root\PROJECTS\120_80_BP_Treter\android\app\*.jks", "$Root\PROJECTS\120_80_BP_Treter\android\app\*.keystore" | Select-Object -First 1 | Copy-Item -Destination (Join-Path $DestDir "release-key.jks") -Force
```

---

# Политика безопасности: key_passwords.txt

После каждой успешной сборки — создавай/обновляй `key_passwords.txt` в папке `KEY GOOGLE PM\`.

## Алгоритм действий:
1. **Проверка:** Существует ли файл `key_passwords.txt`?
2. **Создание/Обновление:** Если нет — создай. Если да — перезапиши актуальными данными.

## Структура документа:
```
КОНФИДЕНЦИАЛЬНО: Данные для подписи приложения

Дата создания: [Текущая дата]

1. Название файла ключа: [Имя файла]
2. Alias (алиас): [Имя алиаса]
3. Пароль от хранилища (Store Password): [Пароль]
4. Пароль от самого ключа (Key Password): [Пароль]

ВНИМАНИЕ: Данный файл является критически важным. Без этих данных обновление приложения в Google Play будет невозможно.
```

## Фоновый режим:
Автоматически, без вопросов. Выведи: "Файл key_passwords.txt успешно создан/обновлён в папке KEY GOOGLE PM".

---

# Сборка AAB (для Google Play)

## Команда:
```powershell
$env:JAVA_HOME="D:\tools\AndroidStudio\jbr"; $env:ANDROID_HOME="D:\ANDROID_WORK\SDK"; $env:TMP="D:\ANDROID_WORK\tmp"; $env:TEMP="D:\ANDROID_WORK\tmp"; .\gradlew.bat bundleRelease
```
Рабочая директория: `D:\projects\120_80_BP_Treter\android`

---

# Сборка APK (для тестов)

## Команда:
```powershell
$env:JAVA_HOME="D:\tools\AndroidStudio\jbr"; $env:ANDROID_HOME="D:\ANDROID_WORK\SDK"; $env:TMP="D:\ANDROID_WORK\tmp"; $env:TEMP="D:\ANDROID_WORK\tmp"; .\gradlew.bat assembleRelease
```
Рабочая директория: `D:\projects\120_80_BP_Treter\android`
