'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import img from "@/assets/img1.png";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useSendContactEmailMutation } from "@/redux/services/email.service";
import { toast } from "sonner";
export default function ContactForm() {
  const [sendContactEmail, { isLoading, error , isSuccess , isError}] = useSendContactEmailMutation();
  const t = useTranslations("HomePage.ContactPage");
  const locale = useLocale();

  // Determine text alignment and flex direction based on locale
  const textAlign = locale === "ar" ? "text-right" : "text-left";
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    acceptTerms: false
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("we have received your message and will get back to you as soon as possible");
    }
    if (isError) {
      toast.error(error?.data?.message);
    }
  }, [isSuccess, isError]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id === "prenom" ? "firstName" : 
       id === "nom" ? "lastName" : 
       id === "objet" ? "subject" : id]: value
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    setFormData({
      ...formData,
      acceptTerms: checked
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
        
    try {
     await sendContactEmail(formData);
      
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  return (
    <div
      id="contact-section"
      className={`text-white max-w-7xl mx-auto  ${textAlign}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 py-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <div
          className={`relative hidden md:block h-[500px] rounded-2xl overflow-hidden 
            ${locale === "ar" ? "md:order-2" : "md:order-1"}`}
        >
          <img
            src={img.src}
            alt="Background"
            className="object-cover w-full h-full rounded-2xl"
          />
        </div>

        {/* Form Section */}
        <div
          className={`space-y-4 max-w-xl 
            ${locale === "ar" ? "md:order-1" : "md:order-2"}`}
        >
          <div className="space-y-1">
            <h1 className={`text-xl font-bold mt-8 ${textAlign}`}>
              {t("title")}
              <br />
              {t("subtitle")}
            </h1>
            <p className={`text-gray-300 ${textAlign}`}>{t("description")}</p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="prenom" className={`text-white ${textAlign}`}>
                  {t("form.firstName")}
                </Label>
                <Input
                  id="prenom"
                  className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className={`text-white ${textAlign}`}>
                  {t("form.lastName")}
                </Label>
                <Input
                  id="nom"
                  className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={`text-white ${textAlign}`}>
                {t("form.email")}
              </Label>
              <Input
                id="email"
                type="email"
                className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objet" className={`text-white ${textAlign}`}>
                {t("form.subject")}
              </Label>
              <Input
                id="objet"
                className="bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className={`text-white ${textAlign}`}>
                {t("form.message")}
              </Label>
              <Textarea
                id="message"
                className="min-h-[80px] bg-transparent border-gray-700 rounded-md focus:border-[#eeff00] focus:ring-[#eeff00]"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <div
              className={`flex items-center ${
                locale === "ar" ? "flex-row-reverse" : "flex-row"
              } space-x-2`}
            >
              <Checkbox
                id="accept"
                className="border-gray-700 data-[state=checked]:bg-[#eeff00] data-[state=checked]:border-[#eeff00]"
                checked={formData.acceptTerms}
                onCheckedChange={handleCheckboxChange}
              />
              <Label
                htmlFor="accept"
                className={`text-sm text-gray-300 ${textAlign}`}
              >
                {t("form.accept")}{" "}
                <span className="text-[#B4E90E] ml-1">
                  {t("form.acceptHighlight")}
                </span>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-[#B4E90E] hover:bg-[#9bcf0e] text-[#0d111a] font-semibold py-3 text-lg rounded-md">
              {t("form.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
