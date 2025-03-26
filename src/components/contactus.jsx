import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import img from "@/assets/img1.png"
import { useTranslations } from 'next-intl'

export default function ContactForm() {
  const t = useTranslations("HomePage.ContactPage")
  const isArabic = t("form.firstName") === "الاسم الأول"; // Check if the current language is Arabic

  return (
    <div className={`text-white ${isArabic ? "text-right" : "text-left"}`}>
      <div className="container mx-auto px-4 py-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Conditional rendering for image and form based on language */}
        <div className={`relative hidden md:block h-[500px] rounded-2xl overflow-hidden ${isArabic ? "order-2" : "order-1"}`}>
          <img
            src={img.src}
            alt="Background"
            className="object-cover w-full h-full rounded-2xl"
          />
        </div>

        {/* Right side - Form */}
        <div className={`space-y-4 max-w-xl ${isArabic ? "order-1" : "order-2"}`}>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">
              {t("title")}
              <br />
              {t("subtitle")}
            </h1>
            <p className="text-gray-300">
              {t("description")}
            </p>
          </div>

          <form className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="prenom" className={`text-white ${isArabic ? "text-right" : "text-left"}`}>{t("form.firstName")}</Label>
                <Input id="prenom" className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nom" className={`text-white ${isArabic ? "text-right" : "text-left"}`}>{t("form.lastName")}</Label>
                <Input id="nom" className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className={`text-white ${isArabic ? "text-right" : "text-left"}`}>{t("form.email")}</Label>
              <Input id="email" type="email" className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="telephone" className={`text-white ${isArabic ? "text-right" : "text-left"}`}>{t("form.phone")}</Label>
              <Input id="telephone" type="tel" className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="objet" className={`text-white ${isArabic ? "text-right" : "text-left"}`}>{t("form.subject")}</Label>
              <Input id="objet" className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="message" className={`text-white ${isArabic ? "text-right" : "text-left"}`}>{t("form.message")}</Label>
              <Textarea id="message" className="min-h-[80px] bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="accept" className="border-gray-700 data-[state=checked]:bg-[#eeff00] data-[state=checked]:border-[#eeff00]" />
              <Label htmlFor="accept" className={`text-sm text-gray-300 ${isArabic ? "text-right" : "text-left"}`}>
                {t("form.accept")} <span className="text-[#B4E90E]">{t("form.acceptHighlight")}</span>
              </Label>
            </div>

            <Button className="w-full bg-[#B4E90E] hover:bg-[#9bcf0e] text-[#0d111a] font-semibold py-3 text-lg rounded-md">
              {t("form.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
