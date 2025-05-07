"use client";
import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { useGetPacksQuery } from "@/redux/services/pack.service";
import { useCreateClientPackMutation } from "@/redux/services/clientpack.service";

const MembershipPlans = () => {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const router = useRouter();
  const { mongoUser, isAuthenticated, isLoading: authLoading } = useAuth();
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
    try {
      if (!isAuthenticated) {
        router.push(`/${locale}/login?redirect=/membership-plans`);
        return;
      }

      if (!mongoUser?._id) {
        console.error("User ID not found");
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

      if (isClientPackError) {
        throw new Error(clientPackError || "Failed to create client pack");
      }

      // Redirect to checkout page
      router.push(`/${locale}/checkoutPage`);
    } catch (error) {
      console.error("Error creating client pack:", error);
      // You might want to show an error message to the user here
    } finally {
      setSubmitting(false);
    }
  };

  if (packsLoading || authLoading)
    return (
      <div className="flex justify-center py-16">
        <div className="text-white">Loading...</div>
      </div>
    );
  if (packsError)
    return (
      <div className="flex justify-center py-16">
        <div className="text-white">
          Error: {packsError?.data?.message || "An error occurred"}
        </div>
      </div>
    );

  return (
    <div
    id="packs"
      className="flex flex-col items-center justify-center py-16 px-4 relative w-full bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dkjx65vc7/image/upload/v1745095664/d295770e25e76451f2a1d3912903708f_dlplhc.jpg')",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
    >
      <div className="absolute inset-0 bg-opacity-100 z-10"></div>

      <div className="text-center flex flex-col items-center mb-10 relative z-10">
        <h2 className="text-md md:text-2xl font-bold flex items-center text-center mb-6 text-white">
          <span className="mx-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
          {t("packtitle")}
          <span className="ml-4 w-28 h-0.5 bg-[#B4E90E] block"></span>
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-6xl justify-center relative z-10">
        {packs.map((pack, index) => {
          const selectedSession = getSelectedSession(pack);
          const isMiddle = index === 1; // Highlight the middle pack
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
              className={`w-full md:w-1/3 border ${isMiddle ? "border-2 border-[#B4E90E] shadow-2xl" : "border-gray-700 hover:border-[#B4E90E] shadow-lg"} rounded-lg p-6 transform transition-transform hover:scale-105 hover:shadow-[#B4E90E]`}
            >
              <h2 className="text-xl font-bold text-[#B4E90E] mb-4 text-center">
                {pack.category?.[locale]}
              </h2>

              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  {t("pricestart")}
                </h3>
                <span className="text-4xl font-bold text-[#B4E90E]">
                  {pack?.startPrice}
                </span>
                <span className="text-sm text-white ml-1">
                  {t("currency", "RS")}
                </span>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-300">
                    {t("sessions", "Sessions")}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {selectedSession.sessionCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300">
                    {t("expiry", "Validity")}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {selectedSession.expirationDays} {t("days", "days")}
                  </p>
                </div>
              </div>

              {/* Session selection dropdown */}
              {pack.sessions.length > 1 && (
                <div className="mb-6">
                  <select
                    value={selectedSessions[pack._id]}
                    className="w-full bg-black bg-opacity-50 border border-gray-700 rounded py-2 px-3 text-white text-sm"
                    onChange={(e) =>
                      handleSessionChange(pack._id, e.target.value)
                    }
                  >
                    {pack.sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {t("sessions", "Sessions")} {session.sessionCount} -{" "}
                        {formatPrice(session.price)} {t("currency", "RS")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="text-white h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center">
                <button
                  className={`px-6 py-2 rounded font-medium transition-colors border border-[#B4E90E] text-white hover:bg-[#B4E90E] hover:text-black ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={() => handleGetStarted(pack)}
                  disabled={submitting}
                >
                  {submitting ? "Processing" : t("packbtn")}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipPlans;
