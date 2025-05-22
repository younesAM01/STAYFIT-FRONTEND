'use client';

import { useTranslations } from 'next-intl';

export default function EmailSentPage() {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">
          {t('emailSent')}
        </h1>
        <p className="text-gray-600">
          {t('checkEmailInstructions')}
        </p>
      </div>
    </div>
  );
}
