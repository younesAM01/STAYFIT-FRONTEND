"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ConfirmationPage() {
  const t = useTranslations("RegisterPage")
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-black/30 rounded-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t("registrationSuccess")}
          </h1>
          <div className="space-y-4 text-gray-300">
            <p>
              {t("confirmationEmailSent")}
            </p>
            <p>
              {t("checkEmailInstructions")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-[#B4E90E] hover:bg-[#a3d40d] text-black font-medium"
          >
            {t("returnToLogin")}
          </Button>
        </div>
      </div>
    </div>
  )
} 