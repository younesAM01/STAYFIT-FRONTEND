"use client"

import {
  Briefcase, 
  Search, 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash, 
  Upload, 
  Menu, 
  X,
  Package,
  User
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useSidebar } from "@/components/ui/sidebar"

export default function ServicesPage() {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    image: null
  })
  const { state } = useSidebar()

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
    }
  }

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-[#121212] rounded-md border border-white/10 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Mobile Sidebar - Only visible on mobile when menu is open */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              className="fixed inset-y-0 left-0 w-64 bg-[#121212] border-r border-white/10 overflow-y-auto"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
            >
              <div className="p-6">
                <div className="space-y-4">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-white">STAY FiT Admin</h2>
                  </div>
                  <nav className="space-y-2">
                    <a href="/dashboard" className="flex items-center px-4 py-2 text-white hover:bg-white/5 rounded-md">
                      <Briefcase className="h-5 w-5 mr-3" />
                      Dashboard
                    </a>
                    <a href="/services" className="flex items-center px-4 py-2 text-white bg-white/10 rounded-md">
                      <Package className="h-5 w-5 mr-3" />
                      Services
                    </a>
                    <a href="/users" className="flex items-center px-4 py-2 text-white hover:bg-white/5 rounded-md">
                      <User className="h-5 w-5 mr-3" />
                      Users
                    </a>
                    {/* Add more menu items as needed */}
                  </nav>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`flex-1 w-full transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "lg:ml-40" : "lg:ml-18"
      } pt-16 lg:pt-0`}>
        <div className="px-4 py-6 md:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Services</h2>
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:space-x-4">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/50" />
                <input 
                  type="search" 
                  placeholder="Search services..." 
                  className="w-full md:w-[300px] pl-8 bg-white border-0 text-black placeholder:text-black/50 rounded-md h-9" 
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-white text-black hover:bg-gray-100 h-9 px-4 py-2 w-full md:w-auto"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" /> Add Service
              </motion.button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { title: "Total Services", value: "8" },
              { title: "Active Services", value: "7" },
              { title: "Most Popular", value: "Yoga" },
              { title: "Avg. Service Rating", value: "4.7/5" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1F1F1F] rounded-xl border border-white/10 p-4 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/60">{stat.title}</h3>
                  <Briefcase className="h-4 w-4 text-white/60" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
              </motion.div>
            ))}
        </div>

          {/* Table Section */}
          <div className="rounded-xl border border-white/10 bg-[#1F1F1F] overflow-hidden">
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-white">Available Services</h3>
              <p className="text-sm text-white/60 mt-1">Manage all coaching services offered on the platform</p>
      </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-full align-middle inline-block min-w-[800px]">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Image
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Title (EN)
                      </th>
                      <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Title (AR)
                      </th>
                      <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Created At
                      </th>
                      <th scope="col" className="relative px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {servicesData?.map((service) => (
                      <motion.tr 
                        key={service?.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-white/5"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-md overflow-hidden">
                            <img src={service?.image} className="h-full w-full object-cover" />
        </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                          {service?.title?.en || 'N/A'}
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-white">
                          {service?.title?.ar || 'N/A'}
                        </td>
                        <td className="hidden lg:table-cell px-4 py-4 text-sm text-white max-w-[200px] truncate">
                          {service?.description?.en || 'N/A'}
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-white">
                          {service?.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative inline-block text-left">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-white hover:text-white/80 p-2"
                              onClick={() => toggleMenu(service?.id)}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </motion.button>
                            <AnimatePresence>
                              {openMenuId === service?.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[#1F1F1F] border border-white/10 shadow-lg focus:outline-none z-50"
                                >
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-sm text-white font-semibold">Actions</div>
                                    <button
                                      className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-white/5"
                                      onClick={() => toggleMenu(service?.id)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </button>
                                    <button
                                      className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-white/5"
                                      onClick={() => toggleMenu(service?.id)}
                                    >
                                      View details
                                    </button>
                                    <div className="border-t border-white/10" />
                                    <button
                                      className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-white/5"
                                      onClick={() => toggleMenu(service?.id)}
                                    >
                                      Assign coaches
                                    </button>
                                    <button
                                      className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-white/5"
                                      onClick={() => toggleMenu(service?.id)}
                                    >
                                      {service?.status === "Active" ? "Deactivate" : "Activate"}
                                    </button>
                                    <div className="border-t border-white/10" />
                                    <button
                                      className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-white/5"
                                      onClick={() => toggleMenu(service?.id)}
                                    >
                                      <Trash className="mr-2 h-4 w-4" /> Delete
                        </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
        </div>
      </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1F1F1F] rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Add New Service</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Title (English)
                        </label>
                        <input
                          type="text"
                          value={formData.title.en}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            title: { ...prev.title, en: e.target.value }
                          }))}
                          className="w-full bg-[#121212] border border-white/10 rounded-md p-2 text-white"
                          placeholder="Enter English title"
                        />
          </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Description (English)
                        </label>
                        <textarea
                          value={formData.description.en}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            description: { ...prev.description, en: e.target.value }
                          }))}
                          className="w-full bg-[#121212] border border-white/10 rounded-md p-2 text-white h-32"
                          placeholder="Enter English description"
                        />
          </div>
        </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Title (Arabic)
                        </label>
                        <input
                          type="text"
                          value={formData.title.ar}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            title: { ...prev.title, ar: e.target.value }
                          }))}
                          className="w-full bg-[#121212] border border-white/10 rounded-md p-2 text-white text-right"
                          placeholder="أدخل العنوان بالعربية"
                          dir="rtl"
                        />
          </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Description (Arabic)
                        </label>
                        <textarea
                          value={formData.description.ar}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            description: { ...prev.description, ar: e.target.value }
                          }))}
                          className="w-full bg-[#121212] border border-white/10 rounded-md p-2 text-white h-32 text-right"
                          placeholder="أدخل الوصف بالعربية"
                          dir="rtl"
                        />
          </div>
        </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white/60 mb-2">Image</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-white/60" />
                          <div className="flex text-sm text-white/60">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-white hover:text-white/80">
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
          </div>
                          <p className="text-xs text-white/60">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
                  </div>
                  <div className="mt-6 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-end sm:space-x-3">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-md text-white/60 hover:text-white border border-white/10 w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 w-full sm:w-auto"
                    >
                      Save Service
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

const servicesData = [
  {
    id: 1,
    title: { 
      en: "Yoga Classes", 
      ar: "دروس اليوغا" 
    },
    description: { 
      en: "Yoga classes for all levels focusing on flexibility, strength, and mindfulness",
      ar: "دروس يوغا لجميع المستويات تركز على المرونة والقوة واليقظة الذهنية"
    },
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: { 
      en: "Strength Training", 
      ar: "تدريب القوة" 
    },
    description: { 
      en: "Personalized strength and conditioning programs to build muscle and improve performance",
      ar: "برامج قوة وتكييف شخصية لبناء العضلات وتحسين الأداء"
    },
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200",
    createdAt: "2024-01-16T10:00:00Z"
  },
  {
    id: 3,
    title: { 
      en: "Nutrition Coaching", 
      ar: "التدريب الغذائي" 
    },
    description: { 
      en: "Customized nutrition plans and guidance for weight management and overall health",
      ar: "خطط تغذية مخصصة وإرشادات لإدارة الوزن والصحة العامة"
    },
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200",
    createdAt: "2024-01-17T10:00:00Z"
  },
  {
    id: 4,
    title: { 
      en: "Functional Training", 
      ar: "التدريب الوظيفي" 
    },
    description: { 
      en: "Training that focuses on building a body capable of doing real-life activities",
      ar: "تدريب يركز على بناء جسم قادر على أداء الأنشطة اليومية"
    },
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=200",
    createdAt: "2024-01-18T10:00:00Z"
  },
  {
    id: 5,
    title: { 
      en: "Cardio Workouts", 
      ar: "تمارين القلب" 
    },
    description: { 
      en: "High-intensity cardio sessions to improve endurance and burn calories",
      ar: "جلسات قلبية عالية الكثافة لتحسين التحمل وحرق السعرات الحرارية"
    },
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=200",
    createdAt: "2024-01-19T10:00:00Z"
  },
  {
    id: 6,
    name: "Meditation",
    category: "Wellness",
    description: "Guided meditation sessions for stress reduction and mental clarity",
    priceRange: "30-100",
    coaches: 2,
    status: "Active",
  },
  {
    id: 7,
    name: "Sports Rehabilitation",
    category: "Recovery",
    description: "Specialized programs for recovery from sports injuries",
    priceRange: "90-300",
    coaches: 2,
    status: "Active",
  },
  {
    id: 8,
    name: "Group Classes",
    category: "Fitness",
    description: "Energetic group fitness classes for motivation and community building",
    priceRange: "20-60",
    coaches: 6,
    status: "Inactive",
  },
]
