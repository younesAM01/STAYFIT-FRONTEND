"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  User, Mail, Phone, MapPin, Calendar, Weight, 
  Ruler, Heart, Globe, Flag, Target, Edit, X 
} from "lucide-react"
import { useAuth } from "@/context/authContext"
import SessionBooking from "@/components/book-session"
import MemberShip from "@/components/membership"
import { useTranslations } from "next-intl" 

export default function ClientProfile() {
  const { mongoUser, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("info")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [packId, setPackId] = useState(null)
  const [loading, setLoading] = useState(true);
  const [clientPack , setClientPack ] = useState({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState(null)
  const profile = "https://res.cloudinary.com/dkjx65vc7/image/upload/v1745098188/blank-profile-picture-973460_960_720_oxeuux.webp"
  const t = useTranslations('ProfilePage');
  // Add this function to ClientProfile
const refreshClientPack = useCallback(async () => {
  if (mongoUser?._id) {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/client-pack?clientId=${mongoUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch membership info');
      }
      const data = await response.json();
      
      // Filter for completed packs that are not expired
      const currentDate = new Date();
      const activeMemberships = data.filter(pack => 
        pack.purchaseState === 'completed' && 
        new Date(pack.expirationDate) > currentDate
      );

      setClientPack(activeMemberships);
    } catch (error) {
      console.error('Error refreshing membership info:', error);
    } finally {
      setLoading(false);
    }
  }
}, [mongoUser]);
  useEffect(() => {
    if (mongoUser?._id) {
      const fetchMembershipInfo = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/client-pack?clientId=${mongoUser._id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch membership info');
          }
          const data = await response.json();
          
          // Filter for completed packs that are not expired
          const currentDate = new Date();
          const activeMemberships = data.filter(pack => 
            pack.purchaseState === 'completed' && 
            new Date(pack.expirationDate) > currentDate
          );

          setClientPack(activeMemberships)
          
          setLoading(false);
          
       
         
        } catch (error) {
          console.error('Error fetching membership info:', error);
          setLoading(false);
        }
      };

      fetchMembershipInfo();
    } else {
      setLoading(false);
    }
  }, [mongoUser]);  
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
    profilePic: profile
  })
  
  const [formData, setFormData] = useState({ ...clientInfo })

  // Initialize client info when mongoUser is available
  useEffect(() => {
    if (mongoUser) {
      setClientInfo(prevInfo => ({
        ...prevInfo,
        firstName: mongoUser.firstName || "---",
        lastName: mongoUser.lastName || "---",
        email: mongoUser.email || "---",
        phoneNumber: mongoUser.phoneNumber || "---",
        city: mongoUser.city || "---",
        age: mongoUser.age || "",
        weight: mongoUser.weight || "",
        height: mongoUser.height || "",
        diseases: mongoUser.diseases || [],
        preferredLanguage: mongoUser.preferredLanguage || "العربية",
        nationality: mongoUser.nationality || "--",
        goals: mongoUser.goals || [],
        profilePic: mongoUser.profilePic || profile
      }));
    }
  }, [mongoUser]);
  
  // Update form data when client info changes
  useEffect(() => {
    setFormData({ ...clientInfo });
  }, [clientInfo]);

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'STAYFIT')
      formData.append('cloud_name', 'dkjx65vc7')
      formData.append('folder', 'Cloudinary-React')

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dkjx65vc7/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      if (data && data.secure_url) {
        return data.secure_url
      } else {
        throw new Error('Failed to get image URL from Cloudinary')
      }
    } catch (err) {
      console.error('Error details:', err)
      throw new Error(`Failed to upload image: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      setFormData(prev => ({ ...prev, imageFile: file }))
      const imageUrl = await handleImageUpload(file)
      setFormData(prev => ({ ...prev, profilePic: imageUrl }))
      setError(null)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image. Please try again.')
    }
  }
  
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleArrayInputChange = useCallback((e, field) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any field has changed
    const hasChanges = Object.keys(formData).some(
      (key) => JSON.stringify(formData[key]) !== JSON.stringify(clientInfo[key])
    );
    console.log(formData)
    if (!hasChanges || !mongoUser?.supabaseId) {
      setIsEditModalOpen(false);
      return;
    }
    
    try {
      const res = await fetch(`/api/users?supabaseId=${mongoUser.supabaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profilePic: formData.profilePic // Pass the profilePic URL from formData
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Update failed:', error);
        return;
      }
      
      const updatedData = await res.json();
      setClientInfo(updatedData);
    } catch (error) {
      console.error('An error occurred while updating:', error);
    } finally {
      setIsEditModalOpen(false);
    }
  };

  // Motion animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Background */}
      <ProfileHero clientInfo={clientInfo} />
      
      {/* Navigation Tabs */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === "info" && (
          <ProfileInfoTab 
            clientInfo={clientInfo} 
            setIsEditModalOpen={setIsEditModalOpen} 
          />
        )}

        {activeTab === "membership" && (
          <MemberShip  />
        )}

        {activeTab === "book" && (
          <motion.div {...fadeIn} className="mx-auto">
            <div className="bg-[#0a0e15] rounded-lg border border-[#161c2a] text-center">
              <SessionBooking 
                clientId={mongoUser?._id} 
                packId={packId} 
                setActiveTab={setActiveTab}
                clientPack={clientPack[0]}
                refreshClientPack={refreshClientPack}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
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
  )
}

// ProfileHero Component
function ProfileHero({ clientInfo }) {
  const t = useTranslations('ProfilePage');
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
              src={clientInfo?.profilePic || profile}
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
              {clientInfo.firstName} <span className="text-[#B4E90E]">{clientInfo.lastName}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl  text-gray-300 mt-2 sm:mt-3"
            >
              {t('title')}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

// TabNavigation Component
function TabNavigation({ activeTab, setActiveTab }) {
  const t = useTranslations('ProfilePage');
  const tabs = [
    { id: "info", label: t('info') },
    { id: "membership", label: t('membership') },
    { id: "book", label: t('book') }
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a0e15] sticky top-0 z-30 border-b border-[#161c2a]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
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
  const t = useTranslations('ProfilePage');
  const infoCards = [
    {
      title: t('contact'),
      icon: User,
      items: [
        { label: t('email'), value: clientInfo.email, icon: Mail },
        { label: t('phoneNumber'), value: clientInfo.phoneNumber, icon: Phone },
        { label: t('city'), value: clientInfo.city, icon: MapPin },
        { label: t('age'), value: `${clientInfo.age} years`, icon: Calendar }
      ]
    },
    {
      title: t('physical'),
      icon: Ruler,
      items: [
        { label: t('weight'), value: `${clientInfo.weight} kg`, icon: Weight },
        { label: t('height'), value: `${clientInfo.height} cm`, icon: Ruler },
        { 
          label: t('healthConsiderations'), 
          value: clientInfo.diseases.length > 0 ? null : "None", 
          list: clientInfo.diseases,
          icon: Heart 
        }
      ]
    },
    {
      title: t('background'),
      icon: Globe,
      items: [
        { label: t('preferredLanguage'), value: clientInfo.preferredLanguage, icon: Globe },
        { label: t('nationality'), value: clientInfo.nationality, icon: Flag }
      ]
    },
    {
      title: t('fitness'),
      icon: Target,
      items: [
        { 
          label: t('goals'), 
          value: clientInfo.goals.length > 0 ? null : "None",
          list: clientInfo.goals.map(goal => ({ text: goal })),
          listType: "bullet"
        }
      ]
    }
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
          {t('title')}
          <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] ml-3 sm:ml-4"></span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 bg-[#161c2a] hover:bg-[#1f2937] text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Edit size={16} className="text-[#B4E90E]" />
          {t('edit')}
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
            {item.icon && <item.icon size={20} className="text-gray-400 mt-1 flex-shrink-0" />}
            <div>
              {item.label && <p className="text-sm text-gray-400">{item.label}</p>}
              
              {item.value && <p className="text-base">{item.value}</p>}
              
              {item.list && item.list.length > 0 && (
                item.listType === "bullet" ? (
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
                )
              )}
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
  handleImageChange 
}) {
  const t = useTranslations('ProfilePage');
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
            {t('edit')}
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
              <h4 className="font-semibold text-[#B4E90E] text-sm uppercase tracking-wider">{t('personal')}</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('firstName')}</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('lastName')}</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('phoneNumber')}</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('city')}</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('age')}</label>
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
              <h4 className="font-semibold text-[#B4E90E] text-sm uppercase tracking-wider">{t('physical')}</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('weight')}</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('height')}</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('health')}</label>
                <input
                  type="text"
                  value={formData.diseases.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'diseases')}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('preferredLanguage')}</label>
                <input
                  type="text"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('nationality')}</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('fitness')}</label>
                <input
                  type="text"
                  value={formData.goals.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'goals')}
                  className="w-full bg-[#161c2a] border border-[#1f2937] rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-[#B4E90E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('profile')}</label>
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
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B4E90E] text-[#0a0e15] font-medium rounded-lg hover:bg-[#a3d00c] transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}