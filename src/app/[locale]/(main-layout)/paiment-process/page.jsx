"use client";
import { useVerifyPaymentQuery } from "@/redux/services/paylink.service";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useUpdateClientPackMutation } from "@/redux/services/clientpack.service";

const PaymentProcess = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const transactionNo = searchParams.get("transactionNo");
  const locale = useLocale();
  const t = useTranslations("Payment");
  const [updateClientPack, { isLoading: isUpdateClientPackLoading }] = useUpdateClientPackMutation();
  const state = "Paid"

  const { data, isLoading } = useVerifyPaymentQuery(transactionNo);
  useEffect(() => {
    if (data?.orderStatus === "Paid") {
      updateClientPack({
        id: orderNumber,
        purchaseState: "completed",
      });
    }
    if (data?.orderStatus === "Pending") {
      updateClientPack({
        id: orderNumber,
        purchaseState: "canceled",
      });
    }
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl bg-[#0d111a] shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 text-[#B4E90E] animate-spin mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("paymentProcess")}
          </h2>
          <p className="text-white mb-6">
           {t("paymentProcessParagraph")}
          </p>
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#B4E90E] rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-[#B4E90E] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#B4E90E] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Payment completed
  if (data?.orderStatus === "Paid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl bg-[#0d111a] shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-4">
            {t("paymentSuccess")}
          </h2>
          <p className="text-white mb-6">
            {t("paymentSuccessParagraph")}
            
          </p>

          {orderNumber && (
            <div className=" rounded-lg p-4 mb-6">
              <p className="text-sm text-[#B4E90E] mb-1">{t("orderNumber")}</p>
              <p className="font-mono text-lg font-semibold text-white">
                #{orderNumber}
              </p>
            </div>
          )}

          {transactionNo && (
            <div className=" rounded-lg p-4 mb-6">
              <p className="text-sm text-[#B4E90E] mb-1">{t("transactionId")}</p>
              <p className="font-mono text-sm text-white">{transactionNo}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href={`/${locale}/client-profile`}
              className="block w-full bg-[#B4E90E] hover:bg-[#a5d40d] text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {t("continueToYourProfile")}
            </Link>
            <Link
              href="/"
              className="block w-full border-2 border-gray-300 hover:border-[#B4E90E] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Canceled state
  if (data?.orderStatus === "Pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl bg-[#0d111a] shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-orange-500 mb-4">
            {t("paymentCanceled")}
          </h2>
          <p className="text-white mb-6">
            {t("paymentCanceledParagraph")}
          </p>

          {orderNumber && (
            <div className=" rounded-lg p-4 mb-6">
              <p className="text-sm text-[#B4E90E] mb-1">{t("orderNumber")}</p>
              <p className="font-mono text-lg font-semibold text-white">
                #{orderNumber}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-[#B4E90E] hover:bg-[#a5d40d] text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failed state - Default for any other status
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="rounded-2xl bg-[#0d111a] shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          {t("paymentFailed")}
        </h2>
        <p className="text-white mb-6">
          {t("paymentFailedParagraph")}
        </p>

        {orderNumber && (
          <div className=" rounded-lg p-4 mb-6">
            <p className="text-sm text-[#B4E90E] mb-1">{t("orderNumber")}</p>
            <p className="font-mono text-lg font-semibold text-white">
              #{orderNumber}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={`/${locale}/checkoutPage`}
            className="block w-full bg-[#B4E90E] hover:bg-[#a5d40d] text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t("tryAgain")}
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-gray-300 hover:border-[#B4E90E] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t("backHome")}
          </Link>
          <Link
            href="/support"
            className="block w-full text-gray-500 hover:text-[#B4E90E] font-medium py-2 transition-colors duration-200"
          >
            {t("contactSupport")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;
