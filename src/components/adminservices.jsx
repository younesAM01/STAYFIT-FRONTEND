"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, Package, CalendarDays, User, Search, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSidebar } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    title: {
      en: "",
      ar: ""
    },
    description: {
      en: "",
      ar: ""
    },
    image: "",
    imageFile: null
  })
  const [activeLanguage, setActiveLanguage] = useState("en")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/services')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch services')
      }
      
      // Add timestamp to force image refresh
      const servicesWithTimestamp = (data.data || []).map(service => ({
        ...service,
        image: service.image + '?t=' + new Date().getTime()
      }))
      
      setServices(servicesWithTimestamp)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching services:', err)
    } finally {
      setIsLoading(false)
    }
  }

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
      console.log('Cloudinary response:', data)

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
      console.log('New image URL:', imageUrl)
      setFormData(prev => ({ ...prev, image: imageUrl }))
      setError(null)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image. Please try again.')
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    try {
      if (!formData.title.en || !formData.description.en || !formData.image) {
        throw new Error('Title (English), description (English), and image are required')
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          image: formData.image
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add service')
      }
      
      await fetchServices()
      setShowAddForm(false)
      setFormData({
        title: {
          en: "",
          ar: ""
        },
        description: {
          en: "",
          ar: ""
        },
        image: "",
        imageFile: null
      })
    } catch (err) {
      console.error('Error adding service:', err)
      setError(err.message)
    }
  }

  const handleUpdateService = async (e) => {
    e.preventDefault()
    try {
      if (!formData.title.en || !formData.description.en) {
        throw new Error('Title and description in English are required')
      }

      console.log('Updating service with data:', {
        title: formData.title,
        description: formData.description,
        image: formData.image
      })

      const response = await fetch(`/api/services?id=${selectedService._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          image: formData.image
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update service')
      }
      
      // Update the services state immediately with the new data
      setServices(prevServices => prevServices.map(service => 
        service._id === selectedService._id 
          ? {
              ...service,
              title: formData.title,
              description: formData.description,
              image: formData.image + '?t=' + new Date().getTime() // Add timestamp to force image refresh
            }
          : service
      ))
      
      setShowEditForm(false)
      setSelectedService(null)
      setError(null)
    } catch (err) {
      console.error('Error updating service:', err)
      setError(err.message)
    }
  }

  const handleDeleteService = async () => {
    try {
      if (!selectedService?._id) {
        throw new Error('No service selected for deletion')
      }

      const response = await fetch(`/api/services?id=${selectedService._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete service')
      }
      
      await fetchServices()
      setShowDeleteDialog(false)
      setSelectedService(null)
    } catch (err) {
      console.error('Error deleting service:', err)
      setError(err.message)
    }
  }

  const filteredData = services.filter((service) => {
    const searchFields = [
      service.title?.en?.toLowerCase() || '',
      service.title?.ar?.toLowerCase() || '',
      service.description?.en?.toLowerCase() || '',
      service.description?.ar?.toLowerCase() || '',
    ]
    const query = searchQuery.toLowerCase()
    return searchFields.some((field) => field.includes(query))
  })

  return (
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
              <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2 ">Total Services</CardTitle>
                <Package className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{services.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2 ">Active Services</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{services.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">Latest Services</CardTitle>
                <CalendarDays className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {services.length > 0 ? services[0]?.title?.en || 'N/A' : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-end justify-end mb-6 gap-3 ">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input 
                type="search" 
                placeholder="Search services..." 
                className="w-[200px] pl-8 bg-gray-300 border-0 text-black placeholder:text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer"
              onClick={() => setShowAddForm(true)}
            >
              Add New
            </Button>
          </div>

          <div className="mb-4 flex justify-end">
            <Tabs defaultValue="en" value={activeLanguage} onValueChange={setActiveLanguage}>
              <TabsList className="bg-[#1F1F1F]">
                <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card className="bg-gray-900 border-0">
            <CardHeader>
              <CardTitle className="text-white mt-3">Available Services</CardTitle>
              <CardDescription className="text-white/60">Manage all services and their details</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-white">Loading...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-red-500">{error}</div>
        </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="border-b-2 border-white/20">
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Image</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Title</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Description</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Created At</th>
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                    </tr>
                  </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-white border-b border-white/10">
                            No services found
                        </td>
                        </tr>
                      ) : (
                        filteredData.map((service) => (
                          <tr key={service._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4 text-sm border-r border-white/10">
                              <img 
                                src={service.image} 
                                alt={service.title?.[activeLanguage] || 'Service Image'}
                                className="w-10 h-10 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/api/placeholder/40/40";
                                }}
                                key={service.image}
                              />
                        </td>
                            <td className="p-4 text-sm font-medium text-white border-r border-white/10">
                              {service.title?.[activeLanguage] || "—"}
                        </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              {service.description?.[activeLanguage] || "—"}
                        </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              {new Date(service.createdAt).toLocaleDateString()}
                        </td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4 text-white" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px] bg-[#1F1F1F] border-white/10">
                                  <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    className="text-white"
                                    onClick={() => {
                                      setSelectedService(service)
                                      setFormData({
                                        title: {
                                          en: service.title?.en || "",
                                          ar: service.title?.ar || ""
                                        },
                                        description: {
                                          en: service.description?.en || "",
                                          ar: service.description?.ar || ""
                                        },
                                        image: service.image || ""
                                      })
                                      setShowEditForm(true)
                                    }}
                                  >
                                    Edit service
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedService(service)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    Delete service
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                  </tbody>
                </table>
        </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new service with title, description and image
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleAddService}>
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="mb-4 bg-[#121212]">
                    <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                    <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title-en">Title (English)</Label>
                        <Input
                          id="title-en"
                          value={formData.title.en}
                          onChange={(e) => setFormData({
                            ...formData, 
                            title: {...formData.title, en: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description-en">Description (English)</Label>
                        <Input
                          id="description-en"
                          value={formData.description.en}
                          onChange={(e) => setFormData({
                            ...formData,
                            description: {...formData.description, en: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="ar">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title-ar">Title (Arabic)</Label>
                        <Input
                          id="title-ar"
                          value={formData.title.ar}
                          onChange={(e) => setFormData({
                            ...formData,
                            title: {...formData.title, ar: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description-ar">Description (Arabic)</Label>
                        <Input
                          id="description-ar"
                          value={formData.description.ar}
                          onChange={(e) => setFormData({
                            ...formData,
                            description: {...formData.description, ar: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="grid gap-2">
                  <Label htmlFor="image">Service Image</Label>
                  <label 
                    htmlFor="file-upload" 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-md cursor-pointer hover:border-white/20"
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-white/60" />
                      <div className="flex text-sm text-white/60">
                        <span className="relative font-medium text-white hover:text-white/80">
                          Upload a file
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={uploadingImage}
                        />
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-white/60">PNG, JPG, GIF up to 10MB</p>
                      {uploadingImage && (
                        <div className="mt-2 text-sm text-white">Uploading...</div>
                      )}
                      {formData.image && (
                        <div className="mt-2">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="mx-auto h-20 w-20 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <DialogFooter className="mt-4 border-t border-white/10 pt-4">
                <Button type="submit" className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors">
                  Add Service
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the service details
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleUpdateService}>
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="mb-4 bg-[#121212]">
                    <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                    <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-title-en">Title (English)</Label>
                        <Input
                          id="edit-title-en"
                          value={formData.title.en}
                          onChange={(e) => setFormData({
                            ...formData, 
                            title: {...formData.title, en: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-description-en">Description (English)</Label>
                        <Input
                          id="edit-description-en"
                          value={formData.description.en}
                          onChange={(e) => setFormData({
                            ...formData,
                            description: {...formData.description, en: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="ar">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-title-ar">Title (Arabic)</Label>
                        <Input
                          id="edit-title-ar"
                          value={formData.title.ar}
                          onChange={(e) => setFormData({
                            ...formData,
                            title: {...formData.title, ar: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-description-ar">Description (Arabic)</Label>
                        <Input
                          id="edit-description-ar"
                          value={formData.description.ar}
                          onChange={(e) => setFormData({
                            ...formData,
                            description: {...formData.description, ar: e.target.value}
                          })}
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="grid gap-2">
                  <Label htmlFor="edit-image">Service Image</Label>
                  <label 
                    htmlFor="edit-file-upload" 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-md cursor-pointer hover:border-white/20"
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-white/60" />
                      <div className="flex text-sm text-white/60">
                        <span className="relative font-medium text-white hover:text-white/80">
                          Upload a file
                        </span>
                        <input
                          id="edit-file-upload"
                          name="edit-file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={uploadingImage}
                        />
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-white/60">PNG, JPG, GIF up to 10MB</p>
                      {uploadingImage && (
                        <div className="mt-2 text-sm text-white">Uploading...</div>
                      )}
                      {formData.image && (
                        <div className="mt-2">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="mx-auto h-20 w-20 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <DialogFooter className="mt-4 border-t border-white/10 pt-4">
                <Button type="submit" className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors">
                  Update Service
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-white/10 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}