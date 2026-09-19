export const locales = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
  },
  {
    code: "pt-PT",
    name: "Portuguese (Portugal)",
    nativeName: "Português (Portugal)",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
  },
  {
    code: "zh-CN",
    name: "Chinese (Simplified)",
    nativeName: "简体中文",
  },
  {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
  },
  {
    code: "af",
    name: "Afrikaans",
    nativeName: "Afrikaans",
  },
  {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文",
  },
  {
    code: "ca",
    name: "Catalan",
    nativeName: "Català",
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
  },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const localeCodes = locales.map((locale) => locale.code);
