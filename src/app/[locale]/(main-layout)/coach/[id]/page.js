"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Medal,
  Languages,
  ChevronRight,
  Edit,
  X,
  Upload,
  Plus,
  Trash,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/redux/services/user.service";

export default function CoachProfile() {
  const locale = useLocale();
  const { mongoUser } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const t = useTranslations("aboutme");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  

  // Extract the coach ID from the URL parameters
  const coachId = params.id;
  const {
    data,
    isLoading: coachLoading,
    isSuccess,
    refetch,
  } = useGetUserByIdQuery(coachId);
  console.log(coachId);

  const [
    updateUser,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      error: updateError,
      isError: isUpdateError,
    },
  ] = useUpdateUserMutation();

  // Effect to handle scrolling after navigation
  

  useEffect(() => {
    if (isSuccess) {
      setCoachData(data?.user);

      // Check if user is missing profile information
      const isIncompleteProfile =
        !data?.user ||
        !data?.user.profilePic ||
        !data?.user.aboutContent?.paragraphs?.[locale]?.length ||
        !data?.user.specialties?.length ||
        !data?.user.certifications?.length;

      setIsFirstTimeUser(isIncompleteProfile);

      // Check if the logged-in user is viewing their own profile
      setIsOwnProfile(mongoUser && mongoUser._id === coachId);

      // If it's the owner with incomplete profile, open the edit modal
      if (isIncompleteProfile && mongoUser && mongoUser._id === coachId) {
        const defaultData = {
          ...data?.user,
          firstName: data?.user?.firstName || "",
          coachnamearabic: data?.user?.coachnamearabic || "",
          lastName: data?.user?.lastName || "",
          phoneNumber: data?.user?.phoneNumber || "",
          age: data?.user?.age || "",
          profilePic: data?.profilePic || "",
          title: {
            en: data?.user?.title?.en || "",
            ar: data?.user?.title?.ar || "",
          },
          aboutContent: {
            paragraphs: {
              en: data?.user?.aboutContent?.paragraphs?.en || [""],
              ar: data?.user?.aboutContent?.paragraphs?.ar || [""],
            },
            languages: data?.user?.aboutContent?.languages || [
              { code: "", name: "" },
            ],
          },
          specialties: data?.user?.specialties || [
            {
              title: { en: "", ar: "" },
              description: { en: "", ar: "" },
            },
          ],
          certifications: data?.user?.certifications || [
            {
              title: { en: "", ar: "" },
              org: "",
            },
          ],
        };

        setEditFormData(defaultData);
        setImagePreview(data?.profilePic || null);
        setIsEditModalOpen(true);
      }
    }
  }, [coachId, isSuccess, data?.profilePic, data?.user, locale, mongoUser]);

  const openEditModal = () => {
    // If editFormData is already set (for first-time users), use that
    if (!editFormData) {
      // Clone coach data to avoid direct mutation
      setEditFormData({
        ...coachData,
        aboutContent: {
          ...coachData?.aboutContent,
          paragraphs: {
            ...coachData?.aboutContent?.paragraphs,
          },
          languages: [...(coachData?.aboutContent?.languages || [])],
        },
        specialties: [...(coachData?.specialties || [])],
        certifications: [...(coachData?.certifications || [])],
      });
      setImagePreview(coachData?.profilePic);
    }
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedImage(null);
    // Only clear image preview if we're not keeping form data for a first-time user
    if (!isFirstTimeUser) {
      setImagePreview(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      if (locale === "en") {
        setEditFormData(prev => ({
          ...prev,
          firstName: value
        }));
      } else if (locale === "ar") {
        setEditFormData(prev => ({
          ...prev,
          coachnamearabic: value
        }));
      }
   
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setEditFormData({
      ...editFormData,
      title: {
        ...editFormData.title,
        [locale]: value, // Only update the current locale version
      },
    });
  };

  const handleParagraphChange = (index, value) => {
    // Clone the paragraphs object first to maintain all locales
    const updatedParagraphs = { ...editFormData.aboutContent.paragraphs };

    // Clone the current locale array
    const localeSpecificParagraphs = [...updatedParagraphs[locale]];

    // Update the specific paragraph in the current locale
    localeSpecificParagraphs[index] = value;

    // Update the paragraphs object with the modified locale array
    updatedParagraphs[locale] = localeSpecificParagraphs;

    setEditFormData({
      ...editFormData,
      aboutContent: {
        ...editFormData.aboutContent,
        paragraphs: updatedParagraphs,
      },
    });
  };

  const addParagraph = () => {
    // Clone the paragraphs object first to maintain all locales
    const updatedParagraphs = { ...editFormData.aboutContent.paragraphs };

    // Clone the current locale array and add empty paragraph
    const localeSpecificParagraphs = [...updatedParagraphs[locale], ""];

    // Update the paragraphs object with the modified locale array
    updatedParagraphs[locale] = localeSpecificParagraphs;

    setEditFormData({
      ...editFormData,
      aboutContent: {
        ...editFormData.aboutContent,
        paragraphs: updatedParagraphs,
      },
    });
  };

  const removeParagraph = (index) => {
    // Clone the paragraphs object first to maintain all locales
    const updatedParagraphs = { ...editFormData.aboutContent.paragraphs };

    // Clone and modify the current locale array
    const localeSpecificParagraphs = [...updatedParagraphs[locale]];
    localeSpecificParagraphs.splice(index, 1);

    // Update the paragraphs object with the modified locale array
    updatedParagraphs[locale] = localeSpecificParagraphs;

    setEditFormData({
      ...editFormData,
      aboutContent: {
        ...editFormData.aboutContent,
        paragraphs: updatedParagraphs,
      },
    });
  };

  const handleLanguageChange = (index, field, value) => {
    const updatedLanguages = [...editFormData.aboutContent.languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value,
    };
    setEditFormData({
      ...editFormData,
      aboutContent: {
        ...editFormData.aboutContent,
        languages: updatedLanguages,
      },
    });
  };

  const addLanguage = () => {
    setEditFormData({
      ...editFormData,
      aboutContent: {
        ...editFormData.aboutContent,
        languages: [
          ...editFormData.aboutContent.languages,
          { code: "", name: "" },
        ],
      },
    });
  };

  const removeLanguage = (index) => {
    const updatedLanguages = [...editFormData.aboutContent.languages];
    updatedLanguages.splice(index, 1);
    setEditFormData({
      ...editFormData,
      aboutContent: {
        ...editFormData.aboutContent,
        languages: updatedLanguages,
      },
    });
  };

  const handleSpecialtyChange = (index, field, value) => {
    const updatedSpecialties = [...editFormData.specialties];

    // Handle differently based on whether the field is localized
    if (field === "title" || field === "description") {
      // Create or update the locale-specific field
      updatedSpecialties[index] = {
        ...updatedSpecialties[index],
        [field]: {
          ...updatedSpecialties[index][field],
          [locale]: value,
        },
      };
    } else {
      // For non-localized fields, update directly
      updatedSpecialties[index] = {
        ...updatedSpecialties[index],
        [field]: value,
      };
    }

    setEditFormData({
      ...editFormData,
      specialties: updatedSpecialties,
    });
  };

  const addSpecialty = () => {
    // Create a new specialty with empty localized fields
    const newSpecialty = {
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
    };

    // Set initial values for current locale
    newSpecialty.title[locale] = "";
    newSpecialty.description[locale] = "";

    setEditFormData({
      ...editFormData,
      specialties: [...editFormData.specialties, newSpecialty],
    });
  };

  const removeSpecialty = (index) => {
    const updatedSpecialties = [...editFormData.specialties];
    updatedSpecialties.splice(index, 1);
    setEditFormData({
      ...editFormData,
      specialties: updatedSpecialties,
    });
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...editFormData.certifications];

    // Handle differently based on whether the field is localized
    if (field === "title") {
      // Create or update the locale-specific field
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [field]: {
          ...updatedCertifications[index][field],
          [locale]: value,
        },
      };
    } else {
      // For non-localized fields (like 'org'), update directly
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [field]: value,
      };
    }

    setEditFormData({
      ...editFormData,
      certifications: updatedCertifications,
    });
  };

  const addCertification = () => {
    // Create a new certification with empty localized fields
    const newCertification = {
      title: { en: "", ar: "" },
      org: "",
    };

    // Set initial values for current locale
    newCertification.title[locale] = "";

    setEditFormData({
      ...editFormData,
      certifications: [...editFormData.certifications, newCertification],
    });
  };

  const removeCertification = (index) => {
    const updatedCertifications = [...editFormData.certifications];
    updatedCertifications.splice(index, 1);
    setEditFormData({
      ...editFormData,
      certifications: updatedCertifications,
    });
  };

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
        return data.secure_url;
      } else {
        throw new Error("Failed to get image URL from Cloudinary");
      }
    } catch (err) {
      console.error("Error details:", err);
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
      setEditFormData((prev) => ({
        ...prev,
        profilePic: imageUrl,
      }));
      setImagePreview(imageUrl);

      console.log("Image uploaded successfully:", imageUrl);
      console.log("Updated formData:", {
        ...editFormData,
        profilePic: imageUrl,
      });

      setError(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    }
  };

  const saveChanges = async () => {
    try {
      // Ensure we have valid data structures before saving
      const dataToSave = {
        ...editFormData,
        firstName: editFormData.firstName || "",
        coachnamearabic: editFormData.coachnamearabic || "",
        aboutContent: {
          ...editFormData.aboutContent,
          paragraphs: {
            en: editFormData.aboutContent?.paragraphs?.en || [""],
            ar: editFormData.aboutContent?.paragraphs?.ar || [""],
          },
          languages: editFormData.aboutContent?.languages?.length
            ? editFormData.aboutContent.languages
            : [{ code: "", name: "" }],
        },
        specialties: editFormData.specialties?.length
          ? editFormData.specialties
          : [
              {
                title: { en: "", ar: "" },
                description: { en: "", ar: "" },
              },
            ],
        certifications: editFormData.certifications?.length
          ? editFormData.certifications
          : [
              {
                title: { en: "", ar: "" },
                org: "",
              },
            ],
      };

      const result = await updateUser({
        id: coachId,
        user: dataToSave,
      });
      console.log("Saving data:", dataToSave);
      if (isUpdateError) {
        console.error("Update failed:", updateError);
        return;
      }

      // Close the modal first
      closeEditModal();

      // Reset first-time user flag if this was their first update
      if (isFirstTimeUser) {
        setIsFirstTimeUser(false);
      }

      // Refetch the data to get the latest state from the server
      await refetch();
    } catch (err) {
      console.error("Error saving coach data:", err);
    }
  };

 

  if (coachLoading) {
    return (
      <div className="min-h-screen bg-[#0d111a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#B4E90E] border-[#161c2a] rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (!coachData && !isFirstTimeUser) {
    return (
      <div className="min-h-screen bg-[#0d111a] text-white flex items-center justify-center">
        <div className="text-center">
          <p>No coach data available.</p>
        </div>
      </div>
    );
  }

  // Render placeholder message if data is empty and not yet editing
  const hasNoData =
    !coachData?.aboutContent?.paragraphs?.[locale]?.length &&
    !coachData?.specialties?.length &&
    !coachData?.certifications?.length;

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Background */}
      <div className="relative h-[40vh] sm:h-[30vh] md:h-[60vh] lg:h-[60vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-[#0d111a] via-[#0d111a]/80 to-[#0d111a]/50 "
        ></motion.div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center"></div>

        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6 sm:pb-8 md:pb-12">
          <div className="flex flex-col items-center sm:items-start md:flex-row md:items-end gap-4 sm:gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-xl overflow-hidden border-4 border-[#B4E90E] shadow-lg shadow-[#B4E90E]/20"
            >
              <Image
                src={
                  coachData?.profilePic ||
                  "/placeholder.svg?height=1080&width=1920"
                }
                alt={`Coach ${coachData?.firstName || "Profile"} ${coachData?.lastName || ""}`}
                width={320}
                height={320}
                className="object-cover w-full h-full"
                priority
              />
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight ${locale === "ar" ? "text-right" : ""}`}
                >
                  {locale === "ar" ? (
                    <>
                      {t("coach")}{" "}
                      <span className="text-[#B4E90E]">
                        {coachData?.coachnamearabic || ""} 
                      </span>
                    </>
                  ) : (
                    <>
                      {t("coach")}{" "}
                      <span className="text-[#B4E90E]">
                        {coachData?.firstName || ""} 
                      </span>
                    </>
                  )}
                </motion.h1>
                {isOwnProfile && (
                  <button
                    onClick={openEditModal}
                    className="ml-3 p-2 bg-[#161c2a] hover:bg-[#B4E90E] hover:text-[#0d111a] rounded-full transition-colors"
                    aria-label="Edit coach profile"
                  >
                    <Edit size={20} />
                  </button>
                )}
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mt-2 sm:mt-3 ${locale === "ar" ? "text-center" : ""}`}
              >
                {locale === "en" ? coachData?.title?.en : coachData?.title?.ar}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0e15] sticky top-0 z-30 border-b border-[#161c2a]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "about"
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t("navigation.about")}
            </button>
            <button
              onClick={() => setActiveTab("specialties")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "specialties"
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t("navigation.specialties")}
            </button>
            <button
              onClick={() => setActiveTab("certifications")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "certifications"
                  ? "border-[#B4E90E] text-[#B4E90E]"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t("navigation.certifications")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {hasNoData && !isEditModalOpen && isOwnProfile ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="bg-[#0a0e15] rounded-lg border border-[#161c2a] p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">{t("welcome")}</h2>
              <p className="text-gray-300 mb-6">
                Your coach profile is empty. Click the edit button to add your
                information.
              </p>
              <button
                onClick={openEditModal}
                className="px-6 py-3 bg-[#B4E90E] text-[#0d111a] rounded-lg font-medium hover:bg-[#9bc80c] inline-flex items-center gap-2"
              >
                <Edit size={18} />
                Complete Your Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "about" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center justify-center">
                  <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
                  {t("sections.about.title")}
                  <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] ml-3 sm:mr-4"></span>
                </h2>
                {coachData?.aboutContent?.paragraphs[locale]?.map(
                  (paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * (index + 1) }}
                      className="text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 text-center text-gray-300"
                    >
                      {paragraph}
                    </motion.p>
                  )
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 sm:mt-12"
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center justify-center">
                    <Languages className="text-[#B4E90E] mr-3" />
                    {t("sections.languages.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {coachData?.aboutContent?.languages?.map((lang, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-[#0a0e15] p-4 sm:p-6 rounded-lg border border-[#161c2a]"
                      >
                        <div className="text-center">
                          <div className="text-4xl sm:text-5xl font-bold mb-2">
                            {lang.code}
                          </div>
                          <div className="text-sm sm:text-base text-gray-400">
                            {lang.name}
                          </div>
                          <div className="mt-4 h-1 bg-[#161c2a] rounded-full overflow-hidden">
                            <div className="h-full bg-[#B4E90E] w-full"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "specialties" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center">
                  <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
                  {t("sections.specialties.title")}
                  <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] ml-3 sm:mr-4"></span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {coachData?.specialties?.map((specialty, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#0a0e15] p-4 sm:p-6 rounded-lg border border-[#161c2a] hover:border-[#B4E90E] transition-colors group"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-[#161c2a] rounded-lg group-hover:bg-[#B4E90E] group-hover:text-[#0d111a] transition-colors">
                          <Dumbbell size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                            {locale === "en"
                              ? specialty.title?.en
                              : specialty.title?.ar}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-400">
                            {locale === "en"
                              ? specialty.description?.en
                              : specialty.description?.ar}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "certifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center">
                  <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
                  {t("sections.certifications.title")}
                  <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] ml-3 sm:mr-4"></span>
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {coachData?.certifications?.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#0a0e15] p-4 sm:p-6 rounded-lg border border-[#161c2a] hover:border-[#B4E90E] transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Medal className="text-[#B4E90E] flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                        <div>
                          <h3 className="text-sm sm:text-base font-bold">
                            {locale === "en" ? cert.title?.en : cert.title?.ar}
                          </h3>
                          {cert.org && (
                            <p className="text-xs sm:text-sm text-gray-400">
                              {cert.org}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0e15] py-8 sm:py-12 mt-8 sm:mt-12"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="max-w-3xl mx-auto bg-gradient-to-r from-[#9bc80c] to-[#B4E90E] rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[#0d111a]">
              {t("cta.title")}
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-[#0d111a]/80">
              {t("cta.description")}
            </p>
            <Link href={`/${locale}/free-session`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-[#0d111a] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-[#161c2a] transition-colors text-sm sm:text-base cursor-pointer"
              >
                {t("cta.button")}
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0e15] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0a0e15] p-4 border-b border-[#161c2a] flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {isFirstTimeUser
                  ? "Complete Your Profile"
                  : "Edit Coach Profile"}
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-[#161c2a] rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {/* Profile Image */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Profile Image</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-[#161c2a]">
                      <Image
                        src={
                          imagePreview ||
                          "/placeholder.svg?height=320&width=320"
                        }
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload new image
                      </label>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-[#161c2a] text-white px-4 py-2 rounded-lg hover:bg-[#1f2937] transition-colors">
                        <Upload size={16} />
                        <span>Choose file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {locale === "en" ? "First Name" : "الاسم الأول"}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={locale === "en" ? (editFormData?.firstName || "") : (editFormData?.coachnamearabic || "")}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-[#161c2a] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                      />
                    </div>
                    <div>
                     
                     
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editFormData?.phoneNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-[#161c2a] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={editFormData?.age || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-[#161c2a] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Title/Position
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editFormData?.title?.[locale] || ""}
                        onChange={handleTitleChange}
                        className="w-full p-2 bg-[#161c2a] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                      />
                    </div>
                  </div>
                </div>

                {/* About Me */}
                <div>
                  <h3 className="text-lg font-bold mb-4">About Me</h3>
                  {editFormData?.aboutContent?.paragraphs[locale]?.map(
                    (paragraph, index) => (
                      <div key={index} className="mb-4 relative">
                        <textarea
                          value={paragraph}
                          onChange={(e) =>
                            handleParagraphChange(index, e.target.value)
                          }
                          className="w-full p-3 bg-[#161c2a] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E] min-h-32"
                          placeholder="Enter paragraph text..."
                        ></textarea>
                        <button
                          onClick={() => removeParagraph(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    )
                  )}
                  <button
                    onClick={addParagraph}
                    className="inline-flex items-center gap-2 text-sm text-[#B4E90E] hover:text-white"
                  >
                    <Plus size={16} />
                    Add Paragraph
                  </button>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Languages</h3>
                  {editFormData?.aboutContent?.languages.map((lang, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-[#161c2a] rounded-lg relative"
                    >
                      <button
                        onClick={() => removeLanguage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Language Code
                          </label>
                          <input
                            type="text"
                            value={lang.code}
                            onChange={(e) =>
                              handleLanguageChange(
                                index,
                                "code",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-[#0a0e15] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                            placeholder="EN"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Language Name
                          </label>
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) =>
                              handleLanguageChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-[#0a0e15] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                            placeholder="English"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addLanguage}
                    className="inline-flex items-center gap-2 text-sm text-[#B4E90E] hover:text-white"
                  >
                    <Plus size={16} />
                    Add Language
                  </button>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Specialties</h3>
                  {editFormData?.specialties.map((specialty, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-[#161c2a] rounded-lg relative"
                    >
                      <button
                        onClick={() => removeSpecialty(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={specialty.title?.[locale] || ""}
                            onChange={(e) =>
                              handleSpecialtyChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-[#0a0e15] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                            placeholder="Specialty title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description
                          </label>
                          <textarea
                            value={specialty.description?.[locale] || ""}
                            onChange={(e) =>
                              handleSpecialtyChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-[#0a0e15] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E] min-h-20"
                            placeholder="Specialty description"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addSpecialty}
                    className="inline-flex items-center gap-2 text-sm text-[#B4E90E] hover:text-white"
                  >
                    <Plus size={16} />
                    Add Specialty
                  </button>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Certifications</h3>
                  {editFormData?.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-[#161c2a] rounded-lg relative"
                    >
                      <button
                        onClick={() => removeCertification(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={cert.title?.[locale] || ""}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-[#0a0e15] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                            placeholder="Certification title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Organization
                          </label>
                          <input
                            type="text"
                            value={cert.org}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "org",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-[#0a0e15] border border-[#252d3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B4E90E]"
                            placeholder="Certifying organization"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addCertification}
                    className="inline-flex items-center gap-2 text-sm text-[#B4E90E] hover:text-white"
                  >
                    <Plus size={16} />
                    Add Certification
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0a0e15] p-4 border-t border-[#161c2a] flex justify-end gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-[#161c2a] text-gray-300 rounded-lg hover:bg-[#252d3d]"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-[#B4E90E] text-[#0d111a] rounded-lg font-medium hover:bg-[#9bc80c]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}