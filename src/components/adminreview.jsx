"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, Package, CalendarDays, User, Search, X, Upload, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSidebar } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetReviewsQuery, useUpdateReviewMutation, useDeleteReviewMutation } from "@/redux/services/review.service"
import { toast } from "sonner"

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: {
      en: "",
      ar: ""
    },
    trainerName: {
      en: "",
      ar: ""
    },
    quote: {
      en: "",
      ar: ""
    },
    rating: 5,
    image: "",
    imageFile: null,
    userId: "",
    coachId: ""
  })
  const [activeLanguage, setActiveLanguage] = useState("en")

  const { data: reviewsResponse, isLoading: isReviewsLoading, error: reviewsError } = useGetReviewsQuery()
  const [updateReview] = useUpdateReviewMutation()
  const [deleteReview] = useDeleteReviewMutation()

  const reviews = reviewsResponse?.data || []

  useEffect(() => {
    if (reviewsError) {
      setError(reviewsError.message || 'Failed to fetch reviews')
      toast.error(reviewsError.message || 'Failed to fetch reviews')
    }
    setIsLoading(isReviewsLoading)
  }, [reviewsError, isReviewsLoading])

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
        toast.success('Image uploaded successfully!')
        return data.secure_url
      } else {
        throw new Error('Failed to get image URL from Cloudinary')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload image. Please try again.')
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
      setFormData(prev => ({ ...prev, image: imageUrl }))
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.')
    }
  }

  const handleUpdateReview = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        id: selectedReview._id
      }

      // Preserve existing quote values and only update what's changed
      updateData.quote = {
        en: formData.quote.en !== undefined ? formData.quote.en : selectedReview.quote?.en || "",
        ar: formData.quote.ar !== undefined ? formData.quote.ar : selectedReview.quote?.ar || ""
      }

      if (formData.rating !== undefined) {
        updateData.rating = formData.rating
      }

      if (formData.image) {
        updateData.image = formData.image
      }

      const result = await updateReview(updateData).unwrap()

      if (!result.success) {
        toast.error(result.error || 'Failed to update review')
        throw new Error(result.error || 'Failed to update review')
      }

      setShowEditForm(false)
      setSelectedReview(null)
      setError(null)
      toast.success('Review updated successfully!')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const handleDeleteReview = async () => {
    try {
      if (!selectedReview?._id) {
        toast.error('No review selected for deletion')
        throw new Error('No review selected for deletion')
      }

      const result = await deleteReview(selectedReview._id).unwrap()

      if (!result.success) {
        toast.error(result.error || 'Failed to delete review')
        throw new Error(result.error || 'Failed to delete review')
      }

      setShowDeleteDialog(false)
      setSelectedReview(null)
      toast.success('Review deleted successfully!')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const filteredData = reviews.filter((review) => {
    if (!searchQuery) return true
    
    const searchFields = [
      review.name?.[activeLanguage]?.toLowerCase() || '',
      review.trainerName?.[activeLanguage]?.toLowerCase() || '',
      review.quote?.[activeLanguage]?.toLowerCase() || ''
    ]
    const query = searchQuery.toLowerCase()
    return searchFields.some((field) => field.includes(query))
  })

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6">Reviews</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6 w-full min-w-0">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Total Reviews</CardTitle>
                <Package className="h-4 w-4 text-[#B4E90E] " />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{reviews.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3 ">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-[#B4E90E] " />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {reviews.length > 0 
                    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Latest Review</CardTitle>
                <CalendarDays className="h-4 w-4 text-[#B4E90E] " />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {reviews.length > 0 ? reviews[0]?.name?.[activeLanguage] || 'N/A' : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="border-t border-white/10 my-6"></div>

          <div className="flex flex-col sm:flex-row justify-end items-center mb-3 sm:mb-6 gap-2 sm:gap-x-3 w-full">
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input 
                type="search" 
                placeholder="Search reviews..." 
                className="w-full pl-8 bg-gray-300 border-0 text-black placeholder:text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <Tabs defaultValue="en" value={activeLanguage} onValueChange={setActiveLanguage}>
                <TabsList className="bg-[#1F1F1F] flex flex-row w-full sm:w-auto">
                  <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black w-full sm:w-auto">English</TabsTrigger>
                  <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black w-full sm:w-auto">Arabic</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <Card className="bg-gray-900 border-0 w-full min-w-0">
            <CardHeader>
              <CardTitle className="text-white mt-3">Available Reviews</CardTitle>
              <CardDescription className="text-white/60">Manage all reviews and their details</CardDescription>
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
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Name</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Trainer</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Quote</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Rating</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-white border-b border-white/10">
                            No reviews found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((review) => (
                          <tr key={review._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm border-r border-white/10">
                              <img 
                                src={review.image} 
                                alt={review.name?.[activeLanguage] || 'Review Image'}
                                className="w-10 h-10 object-cover rounded-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/placeholder.jpg";
                                }}
                                key={review.image}
                              />
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium text-white border-r border-white/10">
                              {review.name?.[activeLanguage] || review.name?.en || review.name?.ar || "—"}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {review.trainerName?.[activeLanguage] || review.trainerName?.en || review.trainerName?.ar || "—"}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {review.quote?.[activeLanguage] || "—"}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {review.rating || "—"}
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
                                      setSelectedReview(review)
                                      setFormData({
                                        name: {
                                          en: review.name?.en || "",
                                          ar: review.name?.ar || ""
                                        },
                                        trainerName: {
                                          en: review.trainerName?.en || "",
                                          ar: review.trainerName?.ar || ""
                                        },
                                        quote: {
                                          en: review.quote?.en || "",
                                          ar: review.quote?.ar || ""
                                        },
                                        rating: review.rating,
                                        image: review.image || ""
                                      })
                                      setShowEditForm(true)
                                    }}
                                  >
                                    Edit review
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedReview(review)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    Delete review
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

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the review details
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div className="grid gap-4 py-4">
                {/* Display Name (Read-only) */}
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <div className="bg-gray-800 p-2 rounded-md">
                    {selectedReview?.name?.en}
                  </div>
                </div>

                {/* Display Trainer Name (Read-only) */}
                <div className="grid gap-2">
                  <Label>Trainer Name</Label>
                  <div className="bg-gray-800 p-2 rounded-md">
                    {selectedReview?.trainerName?.en}
                  </div>
                </div>

                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="mb-4 bg-gray-800">
                    <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                    <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quote-en">Quote (English)</Label>
                      <Input
                        id="edit-quote-en"
                        value={formData.quote.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          quote: {...formData.quote, en: e.target.value}
                        })}
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="ar" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quote-ar">Quote (Arabic)</Label>
                      <Input
                        id="edit-quote-ar"
                        value={formData.quote.ar}
                        onChange={(e) => setFormData({
                          ...formData,
                          quote: {...formData.quote, ar: e.target.value}
                        })}
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                        dir="rtl"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-rating">Rating</Label>
                    <Input
                      id="edit-rating"
                      type="number"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({
                        ...formData,
                        rating: Number(e.target.value)
                      })}
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-image">Review Image</Label>
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
                          className="h-10 w-10 object-cover rounded-full"
                        />
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="text-sm text-white/60">Uploading...</div>
                    )}
                  </div>
                </div>
              </div>
            </form>
            <DialogFooter className="mt-4 border-t border-white/10 pt-4">
              <Button type="submit" onClick={handleUpdateReview} className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors">
                Update Review
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this review? This action cannot be undone.
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
              onClick={handleDeleteReview}
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