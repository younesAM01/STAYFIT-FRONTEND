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
import { useGetServicesQuery, useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation } from "@/redux/services/services.service"
import { toast } from "sonner"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState(null)
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

  const { data: servicesResponse, isLoading, error: queryError } = useGetServicesQuery()
  const [createService] = useCreateServiceMutation()
  const [updateService] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()

  const services = servicesResponse || []

  useEffect(() => {
    console.log('Component mounted');
    console.log('Services response:', servicesResponse);
    console.log('Loading state:', isLoading);
    console.log('Error state:', queryError);
  }, [servicesResponse, isLoading, queryError]);

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
        toast.error('Please fill in all required fields (Title, Description, and Image)')
        return
      }

      const result = await createService({
        title: formData.title,
        description: formData.description,
        image: formData.image
      })

      if ('error' in result) {
        const errorMessage = result.error.data?.message || 
                           result.error.error || 
                           result.error.message || 
                           'Failed to add service'
        
        if (errorMessage.includes('E11000 duplicate key error')) {
          toast.error('A service with this description already exists. Please use a different description.')
        } else {
          toast.error(errorMessage)
        }
        return
      }

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
      setShowAddForm(false)
      toast.success('Service added successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to add service')
    }
  }

  const handleUpdateService = async (e) => {
    e.preventDefault()
    try {
      if (!formData.title.en || !formData.description.en) {
        toast.error('Please fill in all required fields (Title and Description)')
        return
      }

      const result = await updateService({
        id: selectedService._id,
        ...formData
      })

      if ('error' in result) {
        const errorMessage = result.error.data?.message || 
                           result.error.error || 
                           result.error.message || 
                           'Failed to update service'
        
        if (errorMessage.includes('E11000 duplicate key error')) {
          toast.error('A service with this description already exists. Please use a different description.')
        } else {
          toast.error(errorMessage)
        }
        return
      }
      
      setShowEditForm(false)
      setSelectedService(null)
      toast.success('Service updated successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to update service')
    }
  }

  const handleDeleteService = async () => {
    try {
      if (!selectedService?._id) {
        toast.error('No service selected for deletion')
        return
      }

      const result = await deleteService(selectedService._id)

      if ('error' in result) {
        const errorMessage = result.error.data?.message || 
                           result.error.error || 
                           result.error.message || 
                           'Failed to delete service'
        
        toast.error(errorMessage)
        return
      }

      setShowDeleteDialog(false)
      setSelectedService(null)
      toast.success('Service deleted successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to delete service')
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
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6">Services</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6 w-full min-w-0">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Total Services</CardTitle>
                <Package className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{services.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Active Services</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{services.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Latest Service</CardTitle>
                <CalendarDays className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {services.length > 0 ? services[0]?.title?.[activeLanguage] || 'N/A' : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="border-t border-white/10 my-6"></div>

          <div className="flex flex-col sm:flex-row items-end justify-end gap-3 mb-6">
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input 
                type="search" 
                placeholder="Search services..." 
                className="w-full pl-8 bg-gray-300 border-0 text-black placeholder:text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer w-full sm:w-auto whitespace-nowrap"
              onClick={() => setShowAddForm(true)}
            >
              Add New
            </Button>
            <Tabs defaultValue="en" value={activeLanguage} onValueChange={setActiveLanguage}>
              <TabsList className="bg-[#1F1F1F] flex flex-row w-full sm:w-auto">
                <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black w-full sm:w-auto">English</TabsTrigger>
                <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black w-full sm:w-auto">Arabic</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card className="bg-gray-900 border-0 w-full min-w-0">
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
                <div className="block w-full overflow-x-auto rounded-md">
                  <table className="w-full min-w-full md:min-w-[700px] border-collapse text-xs sm:text-sm md:text-base">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="border-b border-white/10">
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Image</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Title</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Description</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Created At</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-white border-b border-white/10">
                            No services found
                          </td>
                        </tr>
                      ) : (
                        services.map((service) => (
                          <tr key={service._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm border-r border-white/10">
                              <img 
                                src={service.image} 
                                alt={service.title?.[activeLanguage] || 'Service Image'}
                                className="w-10 h-10 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/placeholder.jpg";
                                }}
                                key={service.image}
                              />
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium text-white border-r border-white/10">
                              {service.title?.[activeLanguage] || "—"}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {service.description?.[activeLanguage] || "—"}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {new Date(service.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
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
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new service with title, description and image
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleAddService} className="space-y-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-4 bg-gray-800">
                  <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                  <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4">
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
                </TabsContent>
                <TabsContent value="ar" className="space-y-4">
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
                </TabsContent>
              </Tabs>
              <div className="grid gap-2">
                <Label htmlFor="image">Service Image</Label>
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="file-upload" 
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-white/10 rounded-md cursor-pointer hover:border-white/20 bg-gray-800"
                  >
                    <Upload className="h-4 w-4 mr-2 text-white/60" />
                    <span className="text-sm text-white/60">Choose File</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                  </label>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  )}
                </div>
                {uploadingImage && (
                  <div className="text-sm text-white/60">Uploading...</div>
                )}
              </div>
            </form>
          </div>
          <DialogFooter className="mt-4 border-t border-white/10 pt-4">
            <Button type="submit" onClick={handleAddService} className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors">
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the service details
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleUpdateService} className="space-y-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-4 bg-gray-800">
                  <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                  <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4">
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
                </TabsContent>
                <TabsContent value="ar" className="space-y-4">
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
                </TabsContent>
              </Tabs>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Service Image</Label>
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="edit-file-upload" 
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-white/10 rounded-md cursor-pointer hover:border-white/20 bg-gray-800"
                  >
                    <Upload className="h-4 w-4 mr-2 text-white/60" />
                    <span className="text-sm text-white/60">Choose File</span>
                    <input
                      id="edit-file-upload"
                      name="edit-file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                  </label>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  )}
                </div>
                {uploadingImage && (
                  <div className="text-sm text-white/60">Uploading...</div>
                )}
              </div>
            </form>
          </div>
          <DialogFooter className="mt-4 border-t border-white/10 pt-4">
            <Button type="submit" onClick={handleUpdateService} className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors">
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md">
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
              className="hover:bg-gray-800"
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