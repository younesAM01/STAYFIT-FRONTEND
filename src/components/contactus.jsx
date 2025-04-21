import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import img from "@/assets/img1.png"
import { useTranslations, useLocale } from 'next-intl'

export default function ContactForm() {
  const t = useTranslations("HomePage.ContactPage")
  const locale = useLocale()

  // Determine text alignment and flex direction based on locale
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';

  return (
    <div 
      className={`text-white  ${textAlign}`} 
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 py-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <div 
          className={`relative hidden md:block h-[500px] rounded-2xl overflow-hidden 
            ${locale === 'ar' ? 'md:order-2' : 'md:order-1'}`}
        >
          <img
            src="https://res.cloudinary.com/dkjx65vc7/image/upload/v1745094946/img1_taeqz7.png"
            alt="Background"
            className="object-cover w-full h-full rounded-2xl"
          />
        </div>

        {/* Form Section */}
        <div 
          className={`space-y-4 max-w-xl 
            ${locale === 'ar' ? 'md:order-1' : 'md:order-2'}`}
        >
          <div className="space-y-1">
            <h1 className={`text-xl font-bold mt-8 ${textAlign}`}>
              {t("title")}
              <br />
              {t("subtitle")}
            </h1>
            <p className={`text-gray-300 ${textAlign}`}>
              {t("description")}
            </p>
          </div>

          <form className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label 
                  htmlFor="prenom" 
                  className={`text-white ${textAlign}`}
                >
                  {t("form.firstName")}
                </Label>
                <Input 
                  id="prenom" 
                  className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" 
                />
              </div>
              <div className="space-y-2">
                <Label 
                  htmlFor="nom" 
                  className={`text-white ${textAlign}`}
                >
                  {t("form.lastName")}
                </Label>
                <Input 
                  id="nom" 
                  className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" 
                />
              </div>
            </div>

            {/* Repeat similar pattern for other form fields */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className={`text-white ${textAlign}`}
              >
                {t("form.email")}
              </Label>
              <Input 
                id="email" 
                type="email" 
                className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" 
              />
            </div>

            {/* Continue with other form fields similarly */}
            <div className="space-y-2">
              <Label 
                htmlFor="telephone" 
                className={`text-white ${textAlign}`}
              >
                {t("form.phone")}
              </Label>
              <Input 
                id="telephone" 
                type="tel" 
                className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" 
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="objet" 
                className={`text-white ${textAlign}`}
              >
                {t("form.subject")}
              </Label>
              <Input 
                id="objet" 
                className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" 
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="message" 
                className={`text-white ${textAlign}`}
              >
                {t("form.message")}
              </Label>
              <Textarea 
                id="message" 
                className="min-h-[80px] bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]" 
              />
            </div>

            <div className={`flex items-center ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
              <Checkbox 
                id="accept" 
                className="border-gray-700 data-[state=checked]:bg-[#eeff00] data-[state=checked]:border-[#eeff00]" 
              />
              <Label 
                htmlFor="accept" 
                className={`text-sm text-gray-300 ${textAlign}`}
              >
                {t("form.accept")} <span className="text-[#B4E90E] ml-1">{t("form.acceptHighlight")}</span>
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