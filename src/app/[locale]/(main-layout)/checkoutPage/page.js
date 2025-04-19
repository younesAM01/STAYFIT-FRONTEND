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
export default function CheckoutPage() {
  const t = useTranslations("CheckoutPage");
  const locale = useLocale();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [clientPack, setClientPack] = useState(null);
  const [packDetails, setPackDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    user,
    mongoUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter(); // Initialize router
  console.log(mongoUser);

  // Fetch client pack when mongoUser is available
  useEffect(() => {
    const fetchClientPack = async () => {
      if (mongoUser && mongoUser._id) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/client-pack?clientId=${mongoUser._id}`
          );

          if (response.ok) {
            const data = await response.json();
            setClientPack(data);
          } else {
            console.error("Failed to fetch client pack:", response.status);
          }
        } catch (error) {
          console.error("Error fetching client pack:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClientPack();
  }, [mongoUser]);

  // Get the most recent client pack (if there are multiple packs)
  function getLastClientPack(clientPacks) {
    if (!Array.isArray(clientPacks) || clientPacks.length === 0) {
      return null;
    }

    const sortedClientPacks = clientPacks.sort(
      (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
    );
    return sortedClientPacks[0];
  }

  // Use the most recent client pack for the session
  const selectedPack = clientPack ? getLastClientPack(clientPack) : null;
  console.log(selectedPack);

  // Fetch pack details when selectedPack is available
  useEffect(() => {
    const fetchPackDetails = async () => {
      if (selectedPack && selectedPack.pack) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/packs?id=${selectedPack.pack._id}`
          );

          if (response.ok) {
            const data = await response.json();
            setPackDetails(data);
          } else {
            console.log(response);
          }
        } catch (error) {
          console.error("Error fetching pack details:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPackDetails();
  }, [selectedPack]);

  // Calculate days left until expiration
  const getDaysLeft = (expirationDate) => {
    if (!expirationDate) return 0;

    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const handleCancel = async () => {
    if (selectedPack && selectedPack._id) {
      try {
        const response = await fetch(
          `/api/client-pack?id=${selectedPack._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ purchaseState: "cancelled" }),
          }
        );

        if (response.ok) {
          router.push("/"); // Navigate to home after cancellation
        } else {
          console.error("Failed to cancel client pack:", response.status);
        }
      } catch (error) {
        console.error("Error cancelling client pack:", error);
      }
    }
  };

  const handleCompletePurchase = async () => {
    // Simulate a fake payment process
    setIsLoading(true);
    setTimeout(async () => {
      try {
        if (selectedPack && selectedPack._id) {
          const response = await fetch(
            `/api/client-pack?id=${selectedPack._id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ purchaseState: "completed" }),
            }
          );

          if (response.ok) {
            router.push("/client-profile"); // Navigate to home after completion
          } else {
            console.error("Failed to complete purchase:", response.status);
          }
        }
      } catch (error) {
        console.error("Error completing purchase:", error);
      } finally {
        setIsLoading(false);
      }
    }, 2000); // Simulate a 2-second payment processing time
  };

  if (!selectedPack || !packDetails) {
    return <div>Loading...</div>; // Display loading if clientPack or packDetails is not available
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
            <h2 className="text-xl font-semibold mb-4 text-[#B4E90E]">
              {t("yourInformation")}
            </h2>
            <Card className="bg-[#161a26] border-[#2a2f3d] p-6 mb-6">
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
            <h2 className="text-xl font-semibold mb-4 text-[#B4E90E]">
              {t("yourSelectedPackage")}
            </h2>
            <Card className="bg-[#161a26] border-[#2a2f3d] p-6">
              <div className=" p-4 bg-[#0d111a] rounded-lg border border-[#2a2f3d]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#B4E90E]">
                    {packDetails.category?.[locale]}
                  </span>
                  <div className="bg-[#B4E90E] text-[#0d111a] px-3 py-1 rounded-full text-sm font-medium">
                    {selectedPack?.remainingSessions} Session
                  </div>
                </div>
                <div className="flex gap-3 text-sm text-gray-300 mb-2">
                  <span>Price : </span>
                  <span> {selectedPack?.packPrice} RS</span>
                </div>
                <div className="text-sm text-gray-300">
                  Expires in {getDaysLeft(selectedPack?.expirationDate)} days
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#B4E90E] font-medium mb-2">
                  Package Features
                </h3>
                <ul className="space-y-2">
                  {packDetails.features.en.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#B4E90E] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Payment Information - Right Side */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-[#B4E90E]">
              Payment Method
            </h2>
            <Card className="bg-[#161a26] border-[#2a2f3d] p-6">
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
                      Credit Card
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
                      Apple Pay
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === "card" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-gray-300">
                      Name on Card
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="bg-[#0d111a] border-[#2a2f3d] focus:border-[#B4E90E] focus:ring-[#B4E90E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-gray-300">
                      Card Number
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
                        Expiry Date
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
                    Pay with Apple Pay
                  </Button>
                </div>
              )}
            </Card>

            <div className="mt-16">
              <Card className="bg-[#161a26] border-[#2a2f3d] p-6">
                <h3 className="text-lg font-medium mb-4 text-[#B4E90E]">
                  Order Summary
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Pack name</span>
                    <span>{packDetails.category?.[locale]}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Sessions</span>
                    <span>{selectedPack.session?.sessionCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Validity</span>
                    <span>
                      {getDaysLeft(selectedPack?.expirationDate)} days
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Pack Price</span>
                    <span>{selectedPack?.packPrice} RS</span>
                  </div>
                </div>

                <Separator className="my-4 bg-[#2a2f3d]" />

                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Total</span>
                  <span className="text-[#B4E90E]">
                    {selectedPack?.packPrice} RS
                  </span>
                </div>
              </Card>

              <div className="flex justify-between gap-4 mt-6">
                <Button
                  onClick={handleCancel}
                  className="w-1/2 bg-red-500 hover:bg-red-500 text-white font-bold py-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompletePurchase}
                  className="w-1/2 bg-[#B4E90E] hover:bg-[#a3d00d] text-[#0d111a] font-bold py-3"
                >
                  Complete Purchase
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
