"use client";

import { useEffect, useState, useMemo } from "react";
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
  useGetClientPackByIdQuery,
  useUpdateClientPackMutation,
} from "@/redux/services/clientpack.service";
import { useGetCouponsQuery } from "@/redux/services/coupon.service";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations("CheckoutPage");
  const locale = useLocale();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [clientPack, setClientPack] = useState(null);
  const [packDetails, setPackDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isEditingCoupon, setIsEditingCoupon] = useState(true);
  const {
    user,
    mongoUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const id = mongoUser?._id;
  const {
    data,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useGetClientPackByIdQuery(id, { skip: !id });

  const { data: couponsData, isLoading: isCouponsLoading } = useGetCouponsQuery();

  const [
    updateClientPack,
    { isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError },
  ] = useUpdateClientPackMutation();

  useEffect(() => {
    setClientPack(data?.clientPack);
    if (data?.clientPack?.length > 0) {
      const pendingPacks = data.clientPack.filter(
        (pack) => pack.purchaseState === "pending"
      );
      if (pendingPacks.length > 0) {
        const lastPendingPack = [...pendingPacks].sort(
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
        )[0];
        setPackDetails(lastPendingPack);
      }
    }
  }, [data]);

  // Add effect to handle successful update
  useEffect(() => {
    if (isUpdateSuccess) {
      router.push(`/${locale}/client-profile`);
    }
    if (isUpdateError) {
      toast.error("An error occurred while updating your purchase. Please try again.");
    }
  }, [isUpdateSuccess, isUpdateError, updateError, router, locale]);

  const handleCancel = async () => {
    try {
      await updateClientPack({
        id: packDetails?._id,
        purchaseState: "cancelled",
      });
    } catch (err) {
      toast.error("Failed to cancel your purchase. Please try again.");
    }
  };

  const handleCompletePurchase = async () => {
      try {
          const finalPrice = appliedCoupon 
        ? Number((packDetails?.packPrice * (1 - (appliedCoupon.percentage || 0) / 100)).toFixed(2))
        : packDetails?.packPrice;

      await updateClientPack({
        id: packDetails?._id,
                purchaseState: "completed",
                coupon: appliedCoupon?._id,
        finalPrice: finalPrice
      });
    } catch (err) {
      toast.error("Failed to complete your purchase. Please try again.");
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError(t('pleaseEnterCoupon'));
      toast.info(t('pleaseEnterCoupon'));
      return;
    }

    if (!couponsData?.data) {
      setCouponError(t('errorApplyingCoupon'));
      toast.error(t('errorApplyingCoupon'));
      return;
    }

    const coupons = Array.isArray(couponsData.data) ? couponsData.data : [couponsData.data];
        const matchingCoupon = coupons.find(
          c => c.name && c.name.toLowerCase() === couponCode.trim().toLowerCase()
        );

        if (!matchingCoupon) {
          setCouponError(t('invalidCoupon'));
          toast.error(t('invalidCoupon'));
          setAppliedCoupon(null);
          setIsEditingCoupon(true);
          return;
        }

        if (matchingCoupon.status === 'expired') {
          setCouponError(t('couponExpired'));
          toast.error(t('couponExpired'));
          setAppliedCoupon(null);
          setIsEditingCoupon(true);
        } else {
          const percentage = Number(matchingCoupon.percentage);
          if (isNaN(percentage)) {
            toast.error('The coupon discount value is invalid. Please try another coupon.');
            setCouponError(t('errorApplyingCoupon'));
            return;
          }

          const newCouponData = {
            _id: matchingCoupon._id,
            code: couponCode.trim(),
            percentage: percentage,
            timestamp: new Date().getTime()
          };

          setAppliedCoupon(newCouponData);
      setCouponCode("");
          setCouponError("");
          setIsEditingCoupon(false);
    }
  };

  const handleCancelCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setIsEditingCoupon(true);
    toast.info('Coupon removed.');
  };

  const handleUpdateCoupon = () => {
    setIsEditingCoupon(true);
    setCouponError("");
  };

  // Memoize the final price calculation
  const finalPrice = useMemo(() => {
    if (!packDetails?.packPrice) return packDetails?.packPrice;
    
    if (appliedCoupon?.percentage) {
      const discount = (packDetails.packPrice * appliedCoupon.percentage) / 100;
      const discountedPrice = packDetails.packPrice - discount;
      return discountedPrice.toFixed(2);
    }
    
    return packDetails.packPrice;
  }, [packDetails?.packPrice, appliedCoupon]);

  if (isQueryLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen text-white md:mt-16 lg:mt-22 p-2 md:p-6">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl text-center font-bold mb-8 text-[#B4E90E]">
          {t("checkout")}
        </h1>

        {!packDetails ? (
          <div className="bg-[#161a26] border-[#2a2f3d] p-6 rounded-lg text-center">
            <h2 className="text-2xl text-[#B4E90E] font-semibold mb-4">
              {t("noPendingPurchase")}
            </h2>
            <p className="text-gray-300 mb-6">{t("pleaseSelectPackFirst")}</p>
            <Button
              onClick={() => router.push(`/${locale}`)}
              className="bg-[#B4E90E] hover:bg-[#a3d00d] text-[#0d111a] font-bold py-3 px-6"
            >
              {t("goToHomePage")}
            </Button>
          </div>
        ) : (
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
                      className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">
                      {t("lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
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
                    className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-300">
                    {t("address")}
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
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
                      className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-gray-300">
                      {t("zipCode")}
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
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
                          <span className="text-gray-300 text-sm">
                            {feature}
                          </span>
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
                      className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-gray-300">
                        {t("cardNumber")}
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
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
                        className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="text-gray-300">
                        CVC
                      </Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
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
                        {packDetails?.pack?.category?.[locale] ||
                          "Premium Pack"}
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

                  {/* Coupon Input */}
                  <div className="mt-4">
                    {isEditingCoupon ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('enterCouponCode')}
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={isLoading}
                          className="bg-[#B4E90E] hover:bg-[#a3d00d] text-[#0d111a] font-bold whitespace-nowrap"
                        >
                          {t('apply')}
                        </Button>
                      </div>
                    ) : appliedCoupon && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0d111a] text-white px-3 py-2 rounded-md border border-[#2a2f3d]">
                          <span className="font-medium">{appliedCoupon.code}</span>
                          <span className="text-[#B4E90E] ml-2">(-{appliedCoupon.percentage}%)</span>
                        </div>
                        <Button
                          onClick={handleCancelCoupon}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {t('cancel')}
                        </Button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-red-500 text-sm mt-1">{couponError}</p>
                    )}
                    {appliedCoupon && !isEditingCoupon && (
                      <p className="text-[#B4E90E] text-sm mt-1">
                        {t('couponApplied')} ({appliedCoupon.percentage}% {t('off')})
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4 bg-[#2a2f3d]" />

                <div className="flex justify-between text-gray-300 font-bold">
                    <span className={locale === "ar" ? "order-2" : ""}>
                      {t("total")}
                    </span>
                    <span className={locale === "ar" ? "order-1" : ""}>
                      {finalPrice} {t("currency")}
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
        )}
      </div>
    </div>
  );
}