// The parent's home language — the heart of the family-bridge feature. Korea's
// multicultural families skew Asian (Vietnamese, Chinese, Japanese, Filipino,
// Cambodian), so those plus Korean and English are the first-class set. Adding
// more later is just one row here (the digest is AI-translated, so any language
// the model speaks works).
//
// bcp47 drives the in-page read-aloud (Web Speech) so a parent with limited
// literacy can LISTEN to the digest in their own language.

export interface HomeLang {
  code: string; // our stable key
  native: string; // label in its own script (what the family recognizes)
  ko: string; // Korean label for the student-facing picker
  bcp47: string; // SpeechSynthesis language tag
  english: string; // English name, fed to the translator model
}

export const HOME_LANGS: HomeLang[] = [
  { code: "ko", native: "한국어", ko: "한국어", bcp47: "ko-KR", english: "Korean" },
  { code: "vi", native: "Tiếng Việt", ko: "베트남어", bcp47: "vi-VN", english: "Vietnamese" },
  { code: "zh", native: "中文", ko: "중국어", bcp47: "zh-CN", english: "Simplified Chinese" },
  { code: "ja", native: "日本語", ko: "일본어", bcp47: "ja-JP", english: "Japanese" },
  { code: "tl", native: "Tagalog", ko: "필리핀어(타갈로그)", bcp47: "fil-PH", english: "Tagalog (Filipino)" },
  { code: "km", native: "ភាសាខ្មែរ", ko: "크메르어", bcp47: "km-KH", english: "Khmer" },
  { code: "en", native: "English", ko: "영어", bcp47: "en-US", english: "English" },
];

export function homeLang(code?: string): HomeLang {
  return HOME_LANGS.find((l) => l.code === code) ?? HOME_LANGS[0];
}
