export interface LocationLanguageInfo {
  language: string;
  location: string;
  flag: string;
  displayLabel: string;
}

const LANGUAGE_MAP: Record<string, { language: string; location: string; flag: string }> = {
  'en': { language: 'English', location: 'Global', flag: '🌐' },
  'en-us': { language: 'English', location: 'United States', flag: '🇺🇸' },
  'en-gb': { language: 'English', location: 'United Kingdom', flag: '🇬🇧' },
  'en-ca': { language: 'English', location: 'Canada', flag: '🇨🇦' },
  'en-au': { language: 'English', location: 'Australia', flag: '🇦🇺' },
  'en-in': { language: 'English', location: 'India', flag: '🇮🇳' },
  'es': { language: 'Spanish', location: 'Spain / LATAM', flag: '🇪🇸' },
  'es-es': { language: 'Spanish', location: 'Spain', flag: '🇪🇸' },
  'es-mx': { language: 'Spanish', location: 'Mexico', flag: '🇲🇽' },
  'fr': { language: 'French', location: 'France', flag: '🇫🇷' },
  'fr-ca': { language: 'French', location: 'Canada', flag: '🇨🇦' },
  'de': { language: 'German', location: 'Germany', flag: '🇩🇪' },
  'it': { language: 'Italian', location: 'Italy', flag: '🇮🇹' },
  'pt': { language: 'Portuguese', location: 'Portugal', flag: '🇵🇹' },
  'pt-br': { language: 'Portuguese', location: 'Brazil', flag: '🇧🇷' },
  'ja': { language: 'Japanese', location: 'Japan', flag: '🇯🇵' },
  'ko': { language: 'Korean', location: 'South Korea', flag: '🇰🇷' },
  'zh': { language: 'Chinese', location: 'China', flag: '🇨🇳' },
  'hi': { language: 'Hindi', location: 'India', flag: '🇮🇳' },
  'ar': { language: 'Arabic', location: 'Middle East', flag: '🇸🇦' },
  'ru': { language: 'Russian', location: 'Russia', flag: '🇷🇺' },
  'nl': { language: 'Dutch', location: 'Netherlands', flag: '🇳🇱' },
  'sv': { language: 'Swedish', location: 'Sweden', flag: '🇸🇪' },
  'no': { language: 'Norwegian', location: 'Norway', flag: '🇳🇴' },
  'da': { language: 'Danish', location: 'Denmark', flag: '🇩🇰' },
  'fi': { language: 'Finnish', location: 'Finland', flag: '🇫🇮' },
  'tr': { language: 'Turkish', location: 'Turkey', flag: '🇹🇷' },
  'pl': { language: 'Polish', location: 'Poland', flag: '🇵🇱' },
};

export const formatLocationAndLanguage = (code?: string | null): LocationLanguageInfo => {
  if (!code || !code.trim()) {
    return {
      language: 'English',
      location: 'Global',
      flag: '🌐',
      displayLabel: 'Global • English',
    };
  }

  const raw = code.trim();
  const lower = raw.toLowerCase().replace(/_/g, '-');

  if (LANGUAGE_MAP[lower]) {
    const item = LANGUAGE_MAP[lower];
    return {
      ...item,
      displayLabel: `${item.location} • ${item.language}`,
    };
  }

  const primary = lower.split('-')[0];
  if (LANGUAGE_MAP[primary]) {
    const item = LANGUAGE_MAP[primary];
    return {
      language: item.language,
      location: item.location,
      flag: item.flag,
      displayLabel: `${item.location} • ${raw.toUpperCase()}`,
    };
  }

  return {
    language: raw.toUpperCase(),
    location: 'International',
    flag: '🌐',
    displayLabel: `Global • ${raw.toUpperCase()}`,
  };
};
