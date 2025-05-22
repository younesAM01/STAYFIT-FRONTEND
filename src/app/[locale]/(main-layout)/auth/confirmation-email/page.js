'use client';

import { useTranslations } from 'next-intl';

export default function EmailSentPage() {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d111a]">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4 text-[#B4E90E]">
          {t('emailSent')}
        </h1>
        <p className="text-white">
          {t('checkEmailInstructions')}
        </p>
      </div>
    </div>
  );
}
