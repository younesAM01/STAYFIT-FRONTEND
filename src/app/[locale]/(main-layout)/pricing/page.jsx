"use client";
import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { useGetPacksQuery } from "@/redux/services/pack.service";
import { useCreateClientPackMutation } from "@/redux/services/clientpack.service";
import { toast } from "sonner";

const MembershipPlan = () => {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const router = useRouter();
  const { mongoUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [
    createClientPackMutation,
    { isError: isClientPackError, error: clientPackError },
  ] = useCreateClientPackMutation();

  const [packs, setPacks] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const {
    data,
    isLoading: packsLoading,
    error: packsError,
    isSuccess,
  } = useGetPacksQuery();
  useEffect(() => {
    if (isSuccess) {
      setPacks(data?.packs);
    }
  }, [data]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (packsLoading) {
      console.log("Loading membership plans...");
    }
    if (packsError) {
      console.log(packsError?.data?.message || "Failed to load membership plans");
    }
    if (isClientPackError) {
      toast.error(clientPackError?.data?.message || "Failed to create membership");
    }
  }, [packsLoading, packsError, isClientPackError, clientPackError]);

  // Function to handle session selection change
  const handleSessionChange = (packId, sessionId) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [packId]: sessionId,
    }));
  };

  // Function to get current selected session for a pack
  const getSelectedSession = (pack) => {
    const selectedSessionId = selectedSessions[pack._id];
    const packs =
      pack.sessions.find((session) => session._id === selectedSessionId) ||
      pack.sessions[0];
    return packs;
  };

  // Function to format price display
  const formatPrice = (price) => {
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Function to calculate expiration date based on days
  const calculateExpirationDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // Function to handle "Get Started" button click
  const handleGetStarted = async (pack) => {
    if (!isAuthenticated) {
      toast.error(t("login"));
      router.push(`/${locale}/auth/login?redirect=/pricing`);
      return;
    }

    try {
      if (!mongoUser?._id) {
        toast.error("User ID not found");
        return;
      }

      setSubmitting(true);
      const selectedSession = getSelectedSession(pack);

      // Prepare data according to ClientPack schema with MongoDB ObjectId
      const clientPackData = {
        client: mongoUser._id,
        pack: pack._id,
        expirationDate: calculateExpirationDate(selectedSession.expirationDays),
        remainingSessions: selectedSession.sessionCount,
        packPrice: selectedSession.price,
        purchaseState: "pending",
        session: {
          sessionCount: selectedSession.sessionCount,
          expirationDays: selectedSession.expirationDays,
        },
      };

      await createClientPackMutation(clientPackData);
      toast.success(t("Membershipcreat")); 
      setIsNavigating(true);
      router.push(`/${locale}/checkoutPage`);
    } catch (error) {
      console.error("Error creating client pack:", error);
      toast.error(t("Failedtocreate"));
    } finally {
      setSubmitting(false);
    }
  };

  if (packsLoading || authLoading || isNavigating)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  if (packsError)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-white text-xl">
          Error: {packsError?.data?.message || "An error occurred"}
        </div>
      </div>
    );

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 relative w-full bg-cover bg-center pt-24 md:pt-32 overflow-x-hidden"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dkjx65vc7/image/upload/v1745095664/d295770e25e76451f2a1d3912903708f_dlplhc.jpg')",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
    >
      <div className="absolute inset-0 bg-opacity-100 z-10"></div>

      <div className="text-center flex flex-col items-center mb-10 relative z-10">
        <h2 className="text-md md:text-2xl font-bold flex items-center text-center text-white">
          <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block "></span>
          {t("packtitle")}
          <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl px-4 relative z-10 ">
        {(() => {
          // Ensure 'Pack Single' is always first
          let packsToRender = [...packs];
          const singleIndex = packsToRender.findIndex(
            pack => pack.category?.en === 'Pack Single' || pack.category?.ar === 'باقة فردية'
          );
          if (singleIndex !== -1) {
            const [singlePack] = packsToRender.splice(singleIndex, 1);
            packsToRender.unshift(singlePack);
          }
          return packsToRender.map((pack, index) => {
            const selectedSession = getSelectedSession(pack);
            const isMiddle = !isMobile && index === 1; // Only highlight middle pack on desktop
            const features = pack.features[locale] || pack.features.en;
            return (
              <motion.div
                key={pack._id}
                initial={{
                  opacity: 0,
                  x: index === 0 ? -50 : index === 2 ? 50 : 0,
                  y: index === 1 ? 50 : 0,
                }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
                className={`w-full border ${isMiddle ? "border-2 border-[#B4E90E] shadow-2xl" : "border-gray-700 hover:border-[#B4E90E] shadow-lg"} rounded-lg p-4 transform transition-transform hover:scale-105 hover:shadow-[#B4E90E]`}
              >
                <h2 className="text-lg font-bold text-[#B4E90E] mb-3 text-center">
                  {pack.category?.[locale]}
                </h2>

                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-white mb-1">
                    {t("pricestart")}
                  </h3>
                  <span className="text-3xl font-bold text-[#B4E90E]">
                    {pack?.startPrice}
                  </span>
                  <span className="text-sm text-white ml-1">
                    {t("currency", "SR")}
                  </span>
                </div>

                <div className="flex justify-center gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-300">
                      {t("sessions", "Sessions")}
                    </p>
                    <p className="text-base font-bold text-white">
                      {selectedSession.sessionCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-300">
                      {t("expiry", "Validity")}
                    </p>
                    <p className="text-base font-bold text-white">
                      {selectedSession.expirationDays} {t("days", "days")}
                    </p>
                  </div>
                </div>

                {/* Session selection dropdown */}
                {pack.sessions.length > 1 && (
                  <div className="mb-4">
                    <select
                      value={selectedSessions[pack._id]}
                      className="w-full bg-black bg-opacity-50 border border-gray-700 rounded py-1.5 px-2 text-white text-xs"
                      onChange={(e) =>
                        handleSessionChange(pack._id, e.target.value)
                      }
                    >
                      {pack.sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {t("sessions", "Sessions")} {session.sessionCount} - {formatPrice(session.price)} {t("currency", "SR")}
                          {session.price > 1000 && session.upsell ? ` (${locale === 'ar' ? 'ت.ج' : 'PS'} ${session.upsell} ${t("currency", "SR") })` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <ul className="space-y-2 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="text-white h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-center">
                  <button
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors border border-[#B4E90E] text-white hover:bg-[#B4E90E] hover:text-black ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                    onClick={() => handleGetStarted(pack)}
                    disabled={submitting}
                  >
                    {submitting ? "Processing" : t("packbtn")}
                  </button>
                </div>
              </motion.div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default MembershipPlan;