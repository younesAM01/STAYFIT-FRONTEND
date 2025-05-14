"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  Heart,
  Globe,
  Flag,
  Target,
  Edit,
  X,
  ShoppingCart,
  Star,
  Trash,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import SessionBooking from "@/components/book-session";
import MemberShip from "@/components/membership";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useGetClientPackByClientIdQuery } from "@/redux/services/clientpack.service";
import { useUpdateUserMutation, useGetCoachQuery } from "@/redux/services/user.service";
import { useGetReviewsQuery, useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation } from "@/redux/services/review.service";
import { toast } from "sonner";

export default function ClientProfile() {
  const { mongoUser, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [packId, setPackId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientPack, setClientPack] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const {
    data,
    isSuccess,
    isError,
    error: clientPackError,
    refetch,
  } = useGetClientPackByClientIdQuery(mongoUser?._id, {
    skip: !mongoUser?._id,
  });
  const profile =
    "https://res.cloudinary.com/dkjx65vc7/image/upload/v1745098188/blank-profile-picture-973460_960_720_oxeuux.webp";
  const t = useTranslations("ProfilePage");
  
  // Function to get the latest client pack
  const getLatestClientPack = (clientPackArray) => {
    if (!clientPackArray || clientPackArray.length === 0) {
      return null;
    }
    
    // If there's only one pack, return it
    if (clientPackArray.length === 1) {
      return clientPackArray[0];
    }
    
    // Otherwise, return the last one (most recently added)
    return clientPackArray[clientPackArray.length - 1];
  };
  // Add this function to ClientProfile

  useEffect(() => {
    if (isSuccess) {
      setClientPack(data?.clientPack);
      setLoading(false);
    }
    if (isError) {
      setLoading(false);
      if (clientPackError) toast.error(clientPackError.message || "Error loading client pack");
    }
  }, [isSuccess, isError, clientPackError]);
  const [
    updateUser,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      data: updateData,
      error: updateError,
      isError: isUpdateError,
    },
  ] = useUpdateUserMutation();

  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    age: "",
    weight: "",
    height: "",
    diseases: [],
    preferredLanguage: "العربية",
    nationality: "",
    goals: [],
    profilePic: null,
  });

  // Effect to update client info when update is successful
  useEffect(() => {
    if (isUpdateSuccess && updateData) {
      setClientInfo((prev) => ({
        ...prev,
        ...(updateData.user || updateData),
      }));
    }
  }, [isUpdateSuccess, updateData]);

  const [formData, setFormData] = useState({ ...clientInfo });

  // Initialize client info when mongoUser is available
  useEffect(() => {
    if (mongoUser) {
      setClientInfo((prevInfo) => ({
        ...prevInfo,
        firstName: mongoUser.firstName || "",
        lastName: mongoUser.lastName || "",
        email: mongoUser.email || "",
        phoneNumber: mongoUser.phoneNumber || "",
        city: mongoUser.city || "",
        age: mongoUser.age || "",
        weight: mongoUser.weight || "",
        height: mongoUser.height || "",
        diseases: mongoUser.diseases || [],
        preferredLanguage: mongoUser.preferredLanguage || "العربية",
        nationality: mongoUser.nationality || "",
        goals: mongoUser.goals || [],
        profilePic: mongoUser.profilePic || "",
      }));
    }
  }, [mongoUser]);

  // Update form data when client info changes
  useEffect(() => {
    // Ensure no null values in form data
    const sanitizedInfo = {};
    Object.keys(clientInfo).forEach((key) => {
      if (clientInfo[key] === null) {
        if (Array.isArray(clientInfo[key])) {
          sanitizedInfo[key] = [];
        } else if (
          typeof clientInfo[key] === "number" ||
          key === "age" ||
          key === "weight" ||
          key === "height"
        ) {
          sanitizedInfo[key] = "";
        } else {
          sanitizedInfo[key] = "";
        }
      } else {
        sanitizedInfo[key] = clientInfo[key];
      }
    });

    setFormData(sanitizedInfo);
  }, [clientInfo]);

  // Add an effect to handle tab changes when active packages change
  useEffect(() => {
    // If user is on the book tab but no longer has active packages, switch to membership tab
    if (activeTab === "book" && (!clientPack || clientPack.length === 0)) {
      setActiveTab("membership");
    }
  }, [clientPack, activeTab]);

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "STAYFIT");
      formData.append("cloud_name", "dkjx65vc7");
      formData.append("folder", "Cloudinary-React");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dkjx65vc7/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data && data.secure_url) {
        toast.success("Image uploaded successfully!");
        return data.secure_url;
      } else {
        throw new Error("Failed to get image URL from Cloudinary");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
      throw new Error(`Failed to upload image: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Upload image to Cloudinary
      const imageUrl = await handleImageUpload(file);

      // Update form data with the new image URL
      setFormData((prev) => ({
        ...prev,
        profilePic: imageUrl,
      }));

      setError(null);
    } catch (err) {
      toast.error(err.message || "Failed to upload image. Please try again.");
      setError(err.message || "Failed to upload image. Please try again.");
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleArrayInputChange = useCallback((e, field) => {
    const values = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any field has changed
    const hasChanges = Object.keys(formData).some(
      (key) => JSON.stringify(formData[key]) !== JSON.stringify(clientInfo[key])
    );

    if (!hasChanges || !mongoUser?._id) {
      setIsEditModalOpen(false);
      return;
    }

    try {
      // Create a separate object for submission to ensure profilePic is included
      const dataToSubmit = {
        ...formData,
        // Explicitly include profilePic to ensure it's not lost
        profilePic: formData.profilePic,
      };
      await updateUser({
        id: mongoUser._id,
        user: dataToSubmit,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "An error occurred while updating");
    } finally {
      setIsEditModalOpen(false);
    }
  };

  // Motion animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }
//
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Background */}
      <ProfileHero clientInfo={clientInfo} />

      {/* Navigation Tabs */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActivePackages={clientPack && clientPack.length > 0}
      />

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === "info" && (
          <ProfileInfoTab
            clientInfo={clientInfo}
            setIsEditModalOpen={setIsEditModalOpen}
          />
        )}

        {activeTab === "membership" && (
          <MemberShip setActiveTab={setActiveTab} />
        )}

        {activeTab === "reviews" && <Reviews />}

        {activeTab === "book" && (
          <motion.div {...fadeIn} className="mx-auto">
            <div className="bg-[#0a0e15] rounded-lg border border-[#161c2a] text-center">
              {clientPack && clientPack.length > 0 ? (
                  <SessionBooking
                    clientId={mongoUser?._id}
                    packId={packId}
                    setActiveTab={setActiveTab}
                    clientPack={getLatestClientPack(clientPack)}
                    refreshClientPack={refetch}
                  />
                ) : (
                <div className="p-8 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-bold mb-4 text-white">
                    {t("noActivePackages")}
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {t("purchasePackageToBook")}
                  </p>
                  <button
                    className="bg-[#B4E90E] hover:bg-[#A0D50C] text-black font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => (window.location.href = `/${locale}/pricing`)}
                  >
                    <ShoppingCart size={20} />
                    {t("buyAPackage")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Edite Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          formData={formData}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
          handleSubmit={handleSubmit}
          setIsEditModalOpen={setIsEditModalOpen}
          handleImageChange={handleImageChange}
        />
      )}
    </div>
  );
}

// ProfileHero Component
function ProfileHero({ clientInfo }) {
  const t = useTranslations("ProfilePage");
  // Use a unique key based on the profile pic URL to force re-render when it changes
  const profilePicKey = clientInfo?.profilePic || "default-profile";

  return (
    <div className="relative h-[30vh] sm:h-[50vh] md:h-[60vh] lg:h-[60vh] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-r from-[#0d111a] via-[#0d111a]/80 to-[#0d111a]/50 z-10"
      />
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center" />

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-8 md:pb-12">
        <div className="flex flex-col items-center sm:items-start md:flex-row md:items-end gap-4 sm:gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-xl overflow-hidden border-4 border-[#B4E90E] shadow-lg shadow-[#B4E90E]/20"
          >
            <Image
              key={profilePicKey}
              src={
                clientInfo?.profilePic ||
                "https://res.cloudinary.com/dkjx65vc7/image/upload/v1745098188/blank-profile-picture-973460_960_720_oxeuux.webp"
              }
              alt={`${clientInfo.firstName} ${clientInfo.lastName}`}
              width={320}
              height={320}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight"
            >
              {clientInfo.firstName}{" "}
              <span className="text-[#B4E90E]">{clientInfo.lastName}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl  text-gray-300 mt-2 sm:mt-3"
            >
              {t("title")}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

// TabNavigation Component
function TabNavigation({ activeTab, setActiveTab, hasActivePackages }) {
  const t = useTranslations("ProfilePage");
  const tabs = [
    { id: "info", label: t("info") },
    { id: "membership", label: t("membership") },
  ];

  // Only add the book tab if there are active packages with remaining sessions
  if (hasActivePackages) {
    tabs.push(
      { id: "book", label: t("book") },
      { id: "reviews", label: t("reviews") }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a0e15] sticky top-0 z-30 border-b border-[#161c2a]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ProfileInfoTab Component
function ProfileInfoTab({ clientInfo, setIsEditModalOpen }) {
  const t = useTranslations("ProfilePage");
  const infoCards = [
    {
      title: t("contact"),
      icon: User,
      items: [
        { label: t("email"), value: clientInfo.email, icon: Mail },
        { label: t("phoneNumber"), value: clientInfo.phoneNumber, icon: Phone },
        { label: t("city"), value: clientInfo.city, icon: MapPin },
        { label: t("age"), value: `${clientInfo.age} years`, icon: Calendar },
      ],
    },
    {
      title: t("physical"),
      icon: Ruler,
      items: [
        { label: t("weight"), value: `${clientInfo.weight} kg`, icon: Weight },
        { label: t("height"), value: `${clientInfo.height} cm`, icon: Ruler },
        {
          label: t("healthConsiderations"),
          value: clientInfo.diseases.length > 0 ? null : "None",
          list: clientInfo.diseases,
          icon: Heart,
        },
      ],
    },
    {
      title: t("background"),
      icon: Globe,
      items: [
        {
          label: t("preferredLanguage"),
          value: clientInfo.preferredLanguage,
          icon: Globe,
        },
        { label: t("nationality"), value: clientInfo.nationality, icon: Flag },
      ],
    },
    {
      title: t("fitness"),
      icon: Target,
      items: [
        {
          label: t("goals"),
          value: clientInfo.goals.length > 0 ? null : "None",
          list: clientInfo.goals.map((goal) => ({ text: goal })),
          listType: "bullet",
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center mb-4">
          <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
          {t("title")}
          <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] ml-3 sm:ml-4"></span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 bg-[#161c2a] hover:bg-[#1f2937] text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Edit size={16} className="text-[#B4E90E]" />
          {t("edit")}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoCards.map((card, idx) => (
          <InfoCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            items={card.items}
            delay={0.1 * (idx + 1)}
          />
        ))}
      </div>
    </motion.div>
  );
}

// InfoCard Component
function InfoCard({ title, icon: Icon, items, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0a0e15] p-6 rounded-lg border border-[#161c2a]"
    >
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Icon className="text-[#B4E90E] mr-3" />
        {title}
      </h3>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-3">
            {item.icon && (
              <item.icon
                size={20}
                className="text-gray-400 mt-1 flex-shrink-0"
              />
            )}
            <div>
              {item.label && (
                <p className="text-sm text-gray-400">{item.label}</p>
              )}

              {item.value && <p className="text-base">{item.value}</p>}

              {item.list &&
                item.list.length > 0 &&
                (item.listType === "bullet" ? (
                  <ul className="space-y-2">
                    {item.list.map((listItem, listIdx) => (
                      <li key={listIdx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B4E90E]"></div>
                        <span>{listItem.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="text-base list-disc list-inside ml-1">
                    {item.list.map((disease, idx) => (
                      <li key={idx}>{disease}</li>
                    ))}
                  </ul>
                ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// EditProfileModal Component
function EditProfileModal({
  formData,
  handleInputChange,
  handleArrayInputChange,
  handleSubmit,
  setIsEditModalOpen,
  handleImageChange,
}) {
  const t = useTranslations("ProfilePage");
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0e15] max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-[#161c2a] p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center">
            <Edit className="text-[#B4E90E] mr-2" size={20} />
            {t("edit")}
          </h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-2 hover:bg-[#161c2a] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Details Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#B4E90E] text-sm uppercase tracking-wider">
                {t("personal")}
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("firstName")}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("lastName")}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("phoneNumber")}
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("city")}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("age")}
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || 0}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
            </div>

            {/* Physical & Background Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#B4E90E] text-sm uppercase tracking-wider">
                {t("physical")}
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("weight")}
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("height")}
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("health")}
                </label>
                <input
                  type="text"
                  value={formData.diseases.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "diseases")}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("preferredLanguage")}
                </label>
                <input
                  type="text"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("nationality")}
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {t("fitness")}
                </label>
                <input
                  type="text"
                  value={formData.goals.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "goals")}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("profile")}
            </label>
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-[#161c2a] text-white rounded-lg hover:bg-[#1f2937] transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B4E90E] text-[#0a0e15] font-medium rounded-lg hover:bg-[#a3d00c] transition-colors"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Add DeleteConfirmationModal component
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0e15] max-w-md w-full rounded-xl border border-[#161c2a] p-6"
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4">
            {t("confirmDeleteReview")}
          </h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#161c2a] text-white rounded-lg hover:bg-[#1f2937] transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t("delete")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Reviews() {
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const t = useTranslations("ProfilePage");
  const { mongoUser } = useAuth();

  // Get current locale
  const locale = useParams().locale || "en";

  // Redux hooks for reviews (no userId argument, just like adminreview.jsx)
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useGetReviewsQuery();
  const [createReview] = useCreateReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  // Redux hook for coaches
  const { data: coachesData, isLoading: coachesLoading } = useGetCoachQuery();
  const [coaches, setCoaches] = useState([]);

  // Update coaches when data changes
  useEffect(() => {
    if (coachesData) {
      const activeCoaches = coachesData.coach.filter(coach => coach.coachActive === true);
      setCoaches(activeCoaches);
    }
  }, [coachesData]);

  // Update filtered reviews when reviewsData or mongoUser changes
  useEffect(() => {
    const allReviews = reviewsData?.data || [];
    if (mongoUser) {
      setFilteredReviews(allReviews.filter(r => (r.userId?._id || r.userId) === mongoUser._id));
    } else {
      setFilteredReviews([]);
    }
  }, [reviewsData, mongoUser]);

  const handleAddReview = async (reviewData) => {
    try {
      await createReview(reviewData).unwrap();
      await refetchReviews();
      setIsAddReviewModalOpen(false);
      toast.success("Review added successfully!");
    } catch (error) {
      toast.error(error.message || "Error adding review");
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      await updateReview({ id: reviewId, ...updatedData }).unwrap();
      await refetchReviews();
      setIsEditReviewModalOpen(false);
      setSelectedReview(null);
      toast.success("Review updated successfully!");
    } catch (error) {
      toast.error(error.message || "Error updating review");
    }
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview(reviewToDelete._id).unwrap();
      await refetchReviews();
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
      toast.success("Review deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Error deleting review");
    }
  };

  if (reviewsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B4E90E]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("myReviews")}</h2>
        <button
          onClick={() => setIsAddReviewModalOpen(true)}
          className="bg-[#B4E90E] text-black px-4 py-2 rounded-lg hover:bg-[#a3d00c] transition-colors"
        >
          {t("addReview")}
        </button>
      </div>

      {reviewsLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B4E90E]"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">{t("noReviews")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-[#0a0e15] p-6 rounded-lg border border-[#161c2a]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      review.coachId?.profilePic ||
                      review.coachId?.profilePicture ||
                      "https://res.cloudinary.com/dkjx65vc7/image/upload/v1745098188/blank-profile-picture-973460_960_720_oxeuux.webp"
                    }
                    alt={
                      review.coachId
                        ? `${review.coachId.firstName} ${review.coachId.lastName}`
                        : "Coach"
                    }
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {review.coachId
                        ? `${review.coachId.firstName} ${review.coachId.lastName}`
                        : review.trainerName?.[locale] ||
                          review.trainerName?.en ||
                          "Coach"}
                    </h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-4 h-4 ${
                            index < review.rating
                              ? "text-[#B4E90E] fill-[#B4E90E]"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setIsEditReviewModalOpen(true);
                    }}
                    className="p-2 hover:bg-[#161c2a] rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(review)}
                    className="p-2 hover:bg-[#161c2a] rounded-lg transition-colors text-red-500"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <p
                className={`text-gray-300 ${locale === "ar" ? "text-right" : ""}`}
              >
                {review.quote?.[locale] || review.quote?.en || ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {isAddReviewModalOpen && (
        <ReviewModal
          onClose={() => setIsAddReviewModalOpen(false)}
          onSubmit={handleAddReview}
          userId={mongoUser?._id || null}
        />
      )}

      {/* Edit Review Modal */}
      {isEditReviewModalOpen && selectedReview && (
        <ReviewModal
          onClose={() => {
            setIsEditReviewModalOpen(false);
            setSelectedReview(null);
          }}
          onSubmit={(data) => handleUpdateReview(selectedReview._id, data)}
          initialData={selectedReview}
          userId={mongoUser?._id || null}
          isEdit
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        t={t}
      />
    </motion.div>
  );
}

// ReviewModal component
function ReviewModal({ onClose, onSubmit, initialData, userId, isEdit }) {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 5,
    quote: {
      en: initialData?.quote?.en || "",
      ar: initialData?.quote?.ar || "",
    },
    coachId: initialData?.coachId || "",
  });
  const t = useTranslations("ProfilePage");

  // Get coaches from user service
  const { data: coachesData, isLoading: coachesLoading } = useGetCoachQuery();
  const [coaches, setCoaches] = useState([]);

  // Update coaches when data changes
  useEffect(() => {
    if (coachesData) {
      const activeCoaches = coachesData.coach.filter(coach => coach.coachActive === true);
      setCoaches(activeCoaches);
    }
  }, [coachesData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      userId,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0e15] max-w-md w-full rounded-xl border border-[#161c2a] p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {isEdit ? t("editReview") : t("addReview")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#161c2a] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {t("selectCoach")}
              </label>
              {coachesLoading ? (
                <div className="flex items-center justify-center p-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#B4E90E]"></div>
                </div>
              ) : (
                <select
                  value={formData.coachId}
                  onChange={(e) =>
                    setFormData({ ...formData, coachId: e.target.value })
                  }
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                >
                  <option value="">{t("selectCoach")}</option>
                  {coaches &&
                    coaches.map((coach) => (
                      <option key={coach._id} value={coach._id}>
                        {`${coach.firstName} ${coach.lastName}`}
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("rating")}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= formData.rating
                        ? "text-[#B4E90E] fill-[#B4E90E]"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("reviewEnglish")}
            </label>
            <textarea
              value={formData.quote.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quote: { ...formData.quote, en: e.target.value },
                })
              }
              className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("reviewArabic")}
            </label>
            <textarea
              value={formData.quote.ar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quote: { ...formData.quote, ar: e.target.value },
                })
              }
              className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#161c2a] text-white rounded-lg hover:bg-[#1f2937] transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B4E90E] text-[#0a0e15] font-medium rounded-lg hover:bg-[#a3d00c] transition-colors"
            >
              {isEdit ? t("update") : t("submit")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}