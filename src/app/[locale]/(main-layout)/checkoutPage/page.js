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
} from "@/redux/services/clientpack.service";
import { useGetCouponsQuery } from "@/redux/services/coupon.service";
import { toast } from "sonner";
import { z } from "zod";
import { useCreatePaylinkInvoiceMutation } from "@/redux/services/paylink.service";

// Zod validation schema
const clientInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  clientMobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, "Please enter a valid mobile number"),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters"),
  zipCode: z
    .string()
    .min(1, "Zip code is required")
    .regex(/^[0-9]{5,10}$/, "Please enter a valid zip code"),
});

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
  const [
    createPaylinkInvoice,
    {
      isSuccess: isPaylinkSuccess,
      isLoading: isPaylinkLoading,
      isError: isPaylinkError,
      error: paylinkError,
    },
  ] = useCreatePaylinkInvoiceMutation();

  // Form state and validation
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    clientMobile: "",
    city: "",
    zipCode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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

  const { data: couponsData, isLoading: isCouponsLoading } =
    useGetCouponsQuery();

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

  useEffect(() => {
    if (isPaylinkError) {
      toast.error(paylinkError);
    }
  }, [isPaylinkError, paylinkError]);

  // Form validation effect
  useEffect(() => {
    const validateForm = () => {
      try {
        clientInfoSchema.parse(formData);
        setFormErrors({});
        setIsFormValid(true);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = {};
          error.errors.forEach((err) => {
            errors[err.path[0]] = err.message;
          });
          setFormErrors(errors);
        }
        setIsFormValid(false);
      }
    };

    validateForm();
  }, [formData]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate specific field on blur
  const validateField = (field) => {
    try {
      const fieldSchema = clientInfoSchema.shape[field];
      fieldSchema.parse(formData[field]);
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: error.errors[0].message,
        }));
      }
    }
  };

  const handleCompletePurchase = async () => {
    // Validate form before proceeding
    if (!isFormValid) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    try {
      const finalPrice = appliedCoupon
        ? Number(
            (
              packDetails?.packPrice *
              (1 - (appliedCoupon.percentage || 0) / 100)
            ).toFixed(2)
          )
        : packDetails?.packPrice;

      // Get the order number from the last pending client pack's _id
      const pendingPacks =
        data?.clientPack?.filter((pack) => pack.purchaseState === "pending") ||
        [];

      const lastPendingPack =
        pendingPacks.length > 0
          ? [...pendingPacks].sort(
              (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
            )[0]
          : null;

      const orderNumber = lastPendingPack?._id || Date.now().toString();
      console.log(orderNumber);

      // Create the formData object in the required format
      const formDataPayload = {
        orderNumber: orderNumber,
        amount: finalPrice,
        clientName: `${formData.firstName} ${formData.lastName}`,
        clientEmail: formData.email,
        clientMobile: formData.clientMobile,
        products: [
          {
            title: packDetails?.pack?.category?.[locale] || "Package",
            price: packDetails?.packPrice || 0,
            qty: 1,
          },
        ],
        displayPending: true,
        note: `Package purchase: ${packDetails?.pack?.category?.[locale] || "Package"} - ${packDetails?.remainingSessions || 0} sessions`,
      };

      const response = await createPaylinkInvoice(formDataPayload).unwrap();
      if (response.paymentUrl.url) {
        window.location.href = response.paymentUrl.url;
      }
     
    } catch (err) {
      console.error("Error preparing payment data:", err);
      toast.error("Failed to complete your purchase. Please try again.");
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError(t("pleaseEnterCoupon"));
      toast.info(t("pleaseEnterCoupon"));
      return;
    }

    if (!couponsData?.data) {
      setCouponError(t("errorApplyingCoupon"));
      toast.error(t("errorApplyingCoupon"));
      return;
    }

    const coupons = Array.isArray(couponsData.data)
      ? couponsData.data
      : [couponsData.data];
    const matchingCoupon = coupons.find(
      (c) => c.name && c.name.toLowerCase() === couponCode.trim().toLowerCase()
    );

    if (!matchingCoupon) {
      setCouponError(t("invalidCoupon"));
      toast.error(t("invalidCoupon"));
      setAppliedCoupon(null);
      setIsEditingCoupon(true);
      return;
    }

    if (matchingCoupon.status === "expired") {
      setCouponError(t("couponExpired"));
      toast.error(t("couponExpired"));
      setAppliedCoupon(null);
      setIsEditingCoupon(true);
    } else {
      const percentage = Number(matchingCoupon.percentage);
      if (isNaN(percentage)) {
        toast.error(
          "The coupon discount value is invalid. Please try another coupon."
        );
        setCouponError(t("errorApplyingCoupon"));
        return;
      }

      const newCouponData = {
        _id: matchingCoupon._id,
        code: couponCode.trim(),
        percentage: percentage,
        timestamp: new Date().getTime(),
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
    toast.info("Coupon removed.");
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
          <>
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
                          {t("firstName")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          onBlur={() => validateField("firstName")}
                          className={`bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E] ${
                            formErrors.firstName ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-sm">
                            {formErrors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-300">
                          {t("lastName")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          onBlur={() => validateField("lastName")}
                          className={`bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E] ${
                            formErrors.lastName ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.lastName && (
                          <p className="text-red-500 text-sm">
                            {formErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
                        {t("email")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onBlur={() => validateField("email")}
                        className={`bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E] ${
                          formErrors.email ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientMobile" className="text-gray-300">
                        {t("clientMobile")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientMobile"
                        placeholder="+966 59 999 99 99"
                        value={formData.clientMobile}
                        onChange={(e) =>
                          handleInputChange("clientMobile", e.target.value)
                        }
                        onBlur={() => validateField("clientMobile")}
                        className={`bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E] ${
                          formErrors.clientMobile ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.clientMobile && (
                        <p className="text-red-500 text-sm">
                          {formErrors.clientMobile}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-300">
                          {t("city")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          onBlur={() => validateField("city")}
                          className={`bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E] ${
                            formErrors.city ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-sm">
                            {formErrors.city}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-gray-300">
                          {t("zipCode")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="zipCode"
                          placeholder="10001"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          onBlur={() => validateField("zipCode")}
                          className={`bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E] ${
                            formErrors.zipCode ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.zipCode && (
                          <p className="text-red-500 text-sm">
                            {formErrors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Payment Information - Right Side */}
              <div>
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
                        {packDetails?.pack?.category?.[locale] ||
                          "Package Name"}
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
                              placeholder={t("enterCouponCode")}
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="bg-[#0d111a] text-white border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={isLoading}
                              className="bg-[#B4E90E] hover:bg-[#a3d00d] text-[#0d111a] font-bold whitespace-nowrap"
                            >
                              {t("apply")}
                            </Button>
                          </div>
                        ) : (
                          appliedCoupon && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-[#0d111a] text-white px-3 py-2 rounded-md border border-[#2a2f3d]">
                                <span className="font-medium">
                                  {appliedCoupon.code}
                                </span>
                                <span className="text-[#B4E90E] ml-2">
                                  (-{appliedCoupon.percentage}%)
                                </span>
                              </div>
                              <Button
                                onClick={handleCancelCoupon}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                {t("cancel")}
                              </Button>
                            </div>
                          )
                        )}
                        {couponError && (
                          <p className="text-red-500 text-sm mt-1">
                            {couponError}
                          </p>
                        )}
                        {appliedCoupon && !isEditingCoupon && (
                          <p className="text-[#B4E90E] text-sm mt-1">
                            {t("couponApplied")} ({appliedCoupon.percentage}%{" "}
                            {t("off")})
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
                      onClick={() => router.push(`/${locale}/`)}
                      className="w-1/2 bg-red-500 hover:bg-red-500 text-white font-bold py-3 cursor-pointer"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      onClick={handleCompletePurchase}
                      disabled={!isFormValid || isPaylinkLoading}
                      className={`w-1/2 font-bold py-3 cursor-pointer flex items-center justify-center gap-2 ${
                        isFormValid && !isPaylinkLoading
                          ? "bg-[#B4E90E] hover:bg-[#a3d00d] text-[#0d111a]"
                          : "bg-gray-600 cursor-not-allowed text-gray-400"
                      }`}
                    >
                      {isPaylinkLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      )}
                      {isPaylinkLoading
                        ? t("loading") || "Processing..."
                        : t("completePurchase")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
