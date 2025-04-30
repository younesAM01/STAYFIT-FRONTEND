"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

// Framer Motion variants (assuming these are defined correctly)
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const sectionFadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// Helper component for rendering highlighted text using t.rich
const Highlight = ({ children }) => (
  <span className="text-[#B4E90E]">{children}</span>
);

// Helper component for animated sections
const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={sectionFadeIn}
    transition={{ delay: delay * 0.2 }}
    className="mb-12"
  >
    {children}
  </motion.section>
);

export default function TermsAndConditions() {
  const locale = useLocale();
  const t = useTranslations("TermsAndConditions"); // Initialize useTranslations

  const listMarkerStyle = locale === 'ar' ? 'pr-4' : 'pl-4'; // Adjust padding based on locale
  const listAlignment = locale === 'ar' ? 'text-right' : 'text-left'; // Adjust text alignment

  return (
    // Set text direction dynamically based on locale
    <div
      className="min-h-screen text-white py-16 pt-24 md:pt-32"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.rich("pageTitle", {
              highlight: (chunks) => <Highlight>{chunks}</Highlight>,
              highlightClose: () => <></>, // Placeholder if needed by t.rich structure
            })}
          </h1>
          <p className="text-lg text-gray-400">{t("pageSubtitle")}</p>
        </motion.div>

        {/* Section 1: Personal Training & Swimming T&C */}
        <AnimatedSection>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-[#B4E90E] border-b border-gray-700 pb-2 ${listAlignment}`}>
            {t("ptSwimmingSection.title")}
          </h2>
          <div className={`space-y-4 text-lg text-gray-300 ${listAlignment}`}>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("ptSwimmingSection.attendanceTitle")}
              </h3>
              <ul className={`list-disc list-inside space-y-1 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
                <li>{t("ptSwimmingSection.attendancePoint1")}</li>
                <li>{t("ptSwimmingSection.attendancePoint2")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("ptSwimmingSection.completionTitle")}
              </h3>
              <p className="mb-2">{t("ptSwimmingSection.completionDesc")}</p>
              <ul className={`list-disc list-inside space-y-1 ${listMarkerStyle} bg-gray-800 p-4 rounded-md [&>li]:marker:text-[#B4E90E]`}>
                <li>
                  {t.rich("ptSwimmingSection.validity1Session", {
                    highlight: (chunks) => <span className="font-semibold text-[#B4E90E]">{chunks}</span>,
                    highlightClose: () => <></>,
                  })}
                </li>
                <li>
                   {t.rich("ptSwimmingSection.validity6Sessions", {
                    highlight: (chunks) => <span className="font-semibold text-[#B4E90E]">{chunks}</span>,
                    highlightClose: () => <></>,
                  })}
                </li>
                <li>
                   {t.rich("ptSwimmingSection.validity12Sessions", {
                    highlight: (chunks) => <span className="font-semibold text-[#B4E90E]">{chunks}</span>,
                    highlightClose: () => <></>,
                  })}
                </li>
                <li>
                   {t.rich("ptSwimmingSection.validity24Sessions", {
                    highlight: (chunks) => <span className="font-semibold text-[#B4E90E]">{chunks}</span>,
                    highlightClose: () => <></>,
                  })}
                </li>
                <li>
                   {t.rich("ptSwimmingSection.validity50Sessions", {
                    highlight: (chunks) => <span className="font-semibold text-[#B4E90E]">{chunks}</span>,
                    highlightClose: () => <></>,
                  })}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("ptSwimmingSection.contractTitle")}
              </h3>
              <ul className={`list-disc list-inside space-y-1 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
                <li>{t("ptSwimmingSection.contractPoint1")}</li>
                <li>{t("ptSwimmingSection.contractPoint2")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("ptSwimmingSection.notesTitle")}
              </h3>
              <ul className={`list-disc list-inside space-y-1 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
                <li>{t("ptSwimmingSection.notesPoint1")}</li>
                <li>{t("ptSwimmingSection.notesPoint2")}</li>
                <li>{t("ptSwimmingSection.notesPoint3")}</li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        {/* Section 2: General Personal Training T&C */}
        <AnimatedSection delay={1}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-[#B4E90E] border-b border-gray-700 pb-2 ${listAlignment}`}>
            {t("generalPtSection.title")}
          </h2>
          <div className={`space-y-4 text-lg text-gray-300 ${listAlignment}`}>
            <ul className={`list-decimal list-inside space-y-3 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
              <li>
                <span className="font-semibold text-white">
                  {t("generalPtSection.point1Title")}
                </span>{" "}
                {t("generalPtSection.point1Desc")}
              </li>
              <li>
                <span className="font-semibold text-white">
                  {t("generalPtSection.point2Title")}
                </span>{" "}
                {t("generalPtSection.point2Desc")}
              </li>
              <li>
                <span className="font-semibold text-white">
                  {t("generalPtSection.point3Title")}
                </span>{" "}
                {t("generalPtSection.point3Desc")}
              </li>
              <li>
                <span className="font-semibold text-white">
                  {t("generalPtSection.point4Title")}
                </span>{" "}
                {t("generalPtSection.point4Desc")}
              </li>
              <li>
                <span className="font-semibold text-white">
                  {t("generalPtSection.point5Title")}
                </span>{" "}
                {t("generalPtSection.point5Desc")}
              </li>
              <li>
                <span className="font-semibold text-white">
                  {t("generalPtSection.point6Title")}
                </span>{" "}
                {t("generalPtSection.point6Desc")}
              </li>
            </ul>
          </div>
        </AnimatedSection>

        {/* Section 3: Participant Declarations */}
        <AnimatedSection delay={2}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-[#B4E90E] border-b border-gray-700 pb-2 ${listAlignment}`}>
            {t("declarationsSection.title")}
          </h2>
          <div className={`space-y-4 text-lg text-gray-300 ${listAlignment}`}>
            <ul className={`list-decimal list-inside space-y-3 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
              <li>{t("declarationsSection.point1")}</li>
              <li>{t("declarationsSection.point2")}</li>
              <li>{t("declarationsSection.point3")}</li>
              <li>{t("declarationsSection.point4")}</li>
              <li>{t("declarationsSection.point5")}</li>
            </ul>
          </div>
        </AnimatedSection>

        {/* Section 4: Package Freezing */}
        <AnimatedSection delay={3}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-[#B4E90E] border-b border-gray-700 pb-2 ${listAlignment}`}>
            {t("freezeSection.title")}
          </h2>
          <div className={`space-y-6 text-lg text-gray-300 ${listAlignment}`}>
            <p>{t("freezeSection.intro")}</p>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("freezeSection.conditionsTitle")}
              </h3>
              <ul className={`list-disc list-inside space-y-2 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
                <li>{t("freezeSection.condition1")}</li>
                <li>{t("freezeSection.condition2")}</li>
                <li>
                  <span className="font-semibold">
                    {t("freezeSection.condition3Title")}
                  </span>{" "}
                  {t("freezeSection.condition3Desc")}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("freezeSection.howtoTitle")}
              </h3>
              <p className="mb-2">
                {t("freezeSection.howtoDescPart1")}
                <Link
                  href={`mailto:${t("freezeSection.howtoDescLinkText")}`}
                  className="text-[#B4E90E] hover:underline mx-1"
                >
                  {t("freezeSection.howtoDescLinkText")}
                </Link>
                {t("freezeSection.howtoDescPart2")}
              </p>
              <ol className={`list-decimal list-inside space-y-1 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
                <li>{t("freezeSection.howtoPoint1")}</li>
                <li>{t("freezeSection.howtoPoint2")}</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("freezeSection.confirmationTitle")}
              </h3>
              <p>{t("freezeSection.confirmationDesc")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("freezeSection.reactivationTitle")}
              </h3>
              <p>{t("freezeSection.reactivationDesc")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                {t("freezeSection.notesTitle")}
              </h3>
              <ul className={`list-disc list-inside space-y-2 ${listMarkerStyle} [&>li]:marker:text-[#B4E90E]`}>
                <li>{t("freezeSection.notesFreezePoint1")}</li>
                <li>
                  {t("freezeSection.notesFreezePoint2")}
                  <ul className={`list-[circle] list-inside ${listMarkerStyle} mt-1 space-y-1 [&>li]:marker:text-[#B4E90E]`}>
                    <li>{t("freezeSection.notesFreezeOption1")}</li>
                    <li>{t("freezeSection.notesFreezeOption2")}</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        {/* Section 5: Final Confirmation */}
        <AnimatedSection delay={4}>
          <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
            <p className="text-lg text-gray-200 font-semibold">
              {t("finalConfirmation")}
            </p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}