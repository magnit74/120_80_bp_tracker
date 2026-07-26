export const typography = {
  // Цифровой дисплей (Manrope — геометрический, "приборный")
  displayLarge: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 72,
    letterSpacing: -3,
    lineHeight: 76,
  },
  displayMedium: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  displaySmall: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 42,
    letterSpacing: -1.5,
    lineHeight: 46,
  },

  // Заголовки (Inter)
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },

  // Тело
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },

  // Мелкий текст
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  micro: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 14,
  },

  // Кнопки
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },

  // Legacy aliases
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  numberGiant: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 72,
    letterSpacing: -3,
    lineHeight: 80,
  },
  numberLarge: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 52,
    letterSpacing: -2,
    lineHeight: 60,
  },
  numberMedium: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 48,
    letterSpacing: -1.5,
  },
};
