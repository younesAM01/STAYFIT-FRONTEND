"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function FAQ() {
  const t = useTranslations("FAQ");
  const locale = useLocale();
  return (
    <div className="w-full text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-6">{t("faqtitle")}</h1>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center mb-12 ${locale === "ar" ? "sm:flex-row-reverse" : ""}`}
        >
          <p className={`${locale === "ar" ? "text-right" : "text-center"} mb-2 sm:mb-0`}>
            {t("faqdescription")}
          </p>
          <Link
            href="mailto:stayfit@gmail.com"
            className="text-[#B4E90E] hover:underline mx-1"
          >
            stayfit@gmail.com
          </Link>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border-0">
            <AccordionTrigger className="bg-[#1a1f2c] rounded-lg px-6 py-4 text-left hover:no-underline hover:bg-[#232836] data-[state=open]:text-[#B4E90E]">
              <span className="text-lg font-medium">
                {t("question1")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 text-gray-300 text-lg font-medium">
              <span className="text-lg font-medium">
                {t("answer1")}
              </span>
              <br />
              <span className="text-lg font-medium">
                {t("answer11")}
              </span>
              <br />
              <span className="text-lg font-medium">
                {t("answer12")}
              </span>
              <br />
              <span className="text-lg font-medium">
                {t("answer13")}
              </span>
              <br />
              <span className="text-lg font-medium">
                {t("answer14")}
              </span>
              <br />
              <span className="text-lg font-medium">
                {t("answer15")}
              </span>
              <br />
              <span className="text-lg font-medium">
                {t("answer16")}
              </span>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-0">
            <AccordionTrigger className="bg-[#1a1f2c] rounded-lg px-6 py-4 text-left hover:no-underline hover:bg-[#232836] data-[state=open]:text-[#B4E90E]">
              <span className="text-lg font-medium">
                {t("question2")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 text-gray-300 text-lg font-medium">
              <span className="text-lg font-medium">
                {t("answer2")}
              </span>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-0">
            <AccordionTrigger className="bg-[#1a1f2c] rounded-lg px-6 py-4 text-left hover:no-underline hover:bg-[#232836] data-[state=open]:text-[#B4E90E]">
              <span className="text-lg font-medium">
                {t("question3")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 text-gray-300 text-lg font-medium">
              <span className="text-lg font-medium">
                {t("answer3")}
              </span>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border-0">
            <AccordionTrigger className="bg-[#1a1f2c] rounded-lg px-6 py-4 text-left hover:no-underline hover:bg-[#232836] data-[state=open]:text-[#B4E90E]">
              <span className="text-lg font-medium">
                {t("question4")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 text-gray-300 text-lg font-medium">
              <span className="text-lg font-medium">
                {t("answer4")}
              </span>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
