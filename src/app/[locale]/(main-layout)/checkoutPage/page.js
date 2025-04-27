"use client";

import { useEffect, useState } from "react";
import { Apple, CreditCard, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/authContext";
import { useLocale, useTranslations } from "next-intl";
import {
  useGetClientPackByClientIdQuery,
  useUpdateClientPackMutation,
} from "@/redux/services/clientpack.service";

export default function CheckoutPage() {
  const t = useTranslations("CheckoutPage");
  const locale = useLocale();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [clientPack, setClientPack] = useState(null);
  const [packDetails, setPackDetails] = useState(null);
  const {
    user,
    mongoUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter(); // Initialize router
  const id = mongoUser?._id;
  const {
    data,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useGetClientPackByClientIdQuery(id);
  const [
    updateClientPack,
    { isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError },
  ] = useUpdateClientPackMutation();

  useEffect(() => {
    setClientPack(data?.clientPack);
    if (data?.clientPack?.length > 0) {
      const lastPack = [...data.clientPack].sort(
        (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
      )[0];
      setPackDetails(lastPack);
    }
  }, [data]);

  // Add effect to handle successful update
  useEffect(() => {
    if (isUpdateSuccess) {
      router.push("/");
    }
    if (isUpdateError) {
      console.log(updateError);
    }
  }, [isUpdateSuccess, isUpdateError, updateError, router]);

  const handleCancel = async () => {
    try {
      await updateClientPack({
        id: packDetails?._id,
        purchaseState: "cancelled",
      });
    } catch (err) {
      console.error("Error cancelling purchase:", err);
    }
  };

  const handleCompletePurchase = async () => {
    try {
      await updateClientPack({
        id: packDetails?._id,
        purchaseState: "completed",
      });
    } catch (err) {
      console.error("Error completing purchase:", err);
    }
  };
  if (isQueryLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen text-white md:mt-16 lg:mt-22 p-2 md:p-6">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl text-center font-bold mb-8 text-[#B4E90E]">
          {t("checkout")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Information - Left Side */}
          <div>
            <Card className="bg-[#161a26] border-[#2a2f3d] p-6 mb-6">
              <h2
                className={`text-[#B4E90E] font-semibold text-xl mb-2 ${locale === "ar" ? "text-right" : ""}`}
              >
                {t("yourInformation")}
              </h2>
              <div className="space-y-4">
                {/* Client's Personal Info Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">
                      {t("firstName")}
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">
                      {t("lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-300">
                    {t("address")}
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">
                      {t("city")}
                    </Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-gray-300">
                      {t("zipCode")}
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Selected Package Information */}
            <Card className="bg-[#161a26] border-[#2a2f3d] p-6">
              <h2
                className={`text-[#B4E90E] font-semibold text-xl mb-2 ${locale === "ar" ? "text-right" : ""}`}
              >
                {t("yourSelectedPackage")}
              </h2>
              <div className="p-4 bg-[#0d111a] rounded-lg border border-[#2a2f3d]">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`font-medium text-[#B4E90E] ${locale === "ar" ? "order-2" : ""}`}
                  >
                    {packDetails?.pack?.category?.[locale] || "Package Name"}
                  </span>
                  <div
                    className={`bg-[#B4E90E] text-[#0d111a] px-3 py-1 rounded-full text-sm font-medium ${locale === "ar" ? "order-1" : ""}`}
                  >
                    {packDetails?.remainingSessions || 0} {t("sessions")}
                  </div>
                </div>
                <div
                  className={`flex gap-1 text-sm text-gray-300 mb-2 ${locale === "ar" ? "flex-row-reverse" : ""}`}
                >
                  <span>{t("price")}</span>
                  <span>{packDetails?.packPrice || 0}</span> {t("currency")}
                </div>
                <div
                  className={`text-sm text-gray-300 ${locale === "ar" ? "text-right" : ""}`}
                >
                  {t("expiresIn")} {packDetails?.daysBeforeExpiring || 0}{" "}
                  {t("days")}
                </div>
              </div>

              <div className="space-y-2">
                <h3
                  className={`text-[#B4E90E] font-medium mb-2 ${locale === "ar" ? "text-right" : ""}`}
                >
                  {t("packageFeatures")}
                </h3>
                <ul className="space-y-2">
                  {packDetails?.pack?.features?.[locale]?.map(
                    (feature, index) => (
                      <li
                        key={index}
                        className={`flex items-start ${locale === "ar" ? "flex-row-reverse" : ""}`}
                      >
                        <CheckCircle
                          className={`h-5 w-5 text-[#B4E90E] flex-shrink-0 mt-0.5 ${locale === "ar" ? "ml-2" : "mr-2"}`}
                        />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </Card>
          </div>

          {/* Payment Information - Right Side */}
          <div>
            <Card className="bg-[#161a26] border-[#2a2f3d] p-6">
              <h2
                className={`text-[#B4E90E] font-semibold text-xl mb-2 ${locale === "ar" ? "text-right" : ""}`}
              >
                {t("paymentMethod")}
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="mb-6"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="card"
                      id="card"
                      className="border-[#B4E90E] text-[#B4E90E]"
                    />
                    <Label
                      htmlFor="card"
                      className="text-gray-300 flex items-center"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("creditCard")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="apple"
                      id="apple"
                      className="border-[#B4E90E] text-[#B4E90E]"
                    />
                    <Label
                      htmlFor="apple"
                      className="text-gray-300 flex items-center"
                    >
                      <Apple className="mr-2 h-4 w-4" />
                      {t("applePay")}
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === "card" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-gray-300">
                      {t("nameOnCard")}
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-gray-300">
                      {t("cardNumber")}
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-gray-300">
                        {t("expiryDate")}
                      </Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="text-gray-300">
                        CVC
                      </Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button className="w-full py-6 bg-black hover:bg-gray-900 text-white border border-gray-700 flex items-center justify-center">
                    <Apple className="mr-2 h-5 w-5" />
                    {t("applePay")}
                  </Button>
                </div>
              )}
            </Card>
            <div className="mt-16">
              <Card className="bg-[#161a26] border-[#2a2f3d] p-6">
                <h3
                  className={`text-[#B4E90E] font-medium mb-4 ${locale === "ar" ? "text-right" : ""}`}
                >
                  {t("orderSummary")}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-300">
                    <span className={locale === "ar" ? "order-2" : ""}>
                      {t("packName")}
                    </span>
                    <span className={locale === "ar" ? "order-1" : ""}>
                      {packDetails?.pack?.category?.[locale] || "Premium Pack"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className={locale === "ar" ? "order-2" : ""}>
                      {t("sessions")}
                    </span>
                    <span className={locale === "ar" ? "order-1" : ""}>
                      {packDetails?.remainingSessions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className={locale === "ar" ? "order-2" : ""}>
                      {t("validity")}
                    </span>
                    <span className={locale === "ar" ? "order-1" : ""}>
                      {packDetails?.daysBeforeExpiring || 0} {t("days")}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className={locale === "ar" ? "order-2" : ""}>
                      {t("packPrice")}
                    </span>
                    <span className={locale === "ar" ? "order-1" : ""}>
                      {packDetails?.packPrice || 0} {t("currency")}
                    </span>
                  </div>
                </div>

                <Separator className="my-4 bg-[#2a2f3d]" />

                <div className="flex justify-between text-gray-300 font-bold">
                  <span className={locale === "ar" ? "order-2" : ""}>
                    {t("total")}
                  </span>
                  <span className={locale === "ar" ? "order-1" : ""}>
                    {packDetails?.packPrice || 0} {t("currency")}
                  </span>
                </div>
              </Card>

              <div className="flex justify-between gap-4 mt-6">
                <Button
                  onClick={handleCancel}
                  className="w-1/2 bg-red-500 hover:bg-red-500 text-white font-bold py-3"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleCompletePurchase}
                  className="w-1/2 bg-[#B4E90E] hover:bg-[#a3d00d] text-[#0d111a] font-bold py-3"
                >
                  {t("completePurchase")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
