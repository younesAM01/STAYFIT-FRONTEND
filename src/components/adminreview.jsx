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

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
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
    imageFile: null
  })
  const [activeLanguage, setActiveLanguage] = useState("en")

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/review')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews')
      }
      
      console.log('Fetched reviews:', data)
      
      const reviewsWithTimestamp = (data.reviews || data.data || []).map(review => ({
        ...review,
        name: review.name || { en: '', ar: '' },
        trainerName: review.trainerName || { en: '', ar: '' },
        quote: review.quote || { en: '', ar: '' },
        image: review.image + '?t=' + new Date().getTime(),
        rating: review.rating || 5
      }))
      
      console.log('Processed reviews:', reviewsWithTimestamp)
      
      setReviews(reviewsWithTimestamp)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reviews:', err)
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

  const handleAddReview = async (e) => {
    e.preventDefault()
    try {
      if (!formData.name.en || !formData.trainerName.en || !formData.quote.en || !formData.image) {
        throw new Error('Name, trainer name, quote (in English), and image are required')
      }

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          trainerName: formData.trainerName,
          quote: formData.quote,
          rating: formData.rating,
          image: formData.image
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add review')
      }
      
      await fetchReviews()
      setShowAddForm(false)
      setFormData({
        name: { en: "", ar: "" },
        trainerName: { en: "", ar: "" },
        quote: { en: "", ar: "" },
        rating: 5,
        image: "",
        imageFile: null
      })
    } catch (err) {
      console.error('Error adding review:', err)
      setError(err.message)
    }
  }

  const handleUpdateReview = async (e) => {
    e.preventDefault()
    try {
      if (!formData.name.en || !formData.trainerName.en || !formData.quote.en) {
        throw new Error('Name, trainer name, and quote in English are required')
      }

      console.log('Updating review with data:', {
        name: formData.name,
        trainerName: formData.trainerName,
        quote: formData.quote,
        rating: formData.rating,
        image: formData.image
      })

      const response = await fetch(`/api/review?id=${selectedReview._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          trainerName: formData.trainerName,
          quote: formData.quote,
          rating: formData.rating,
          image: formData.image
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update review')
      }
      
      setReviews(prevReviews => prevReviews.map(review => 
        review._id === selectedReview._id 
          ? {
              ...review,
              name: formData.name,
              trainerName: formData.trainerName,
              quote: formData.quote,
              rating: formData.rating,
              image: formData.image + '?t=' + new Date().getTime()
            }
          : review
      ))
      
      setShowEditForm(false)
      setSelectedReview(null)
      setError(null)
    } catch (err) {
      console.error('Error updating review:', err)
      setError(err.message)
    }
  }

  const handleDeleteReview = async () => {
    try {
      if (!selectedReview?._id) {
        throw new Error('No review selected for deletion')
      }

      const response = await fetch(`/api/review?id=${selectedReview._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review')
      }
      
      await fetchReviews()
      setShowDeleteDialog(false)
      setSelectedReview(null)
    } catch (err) {
      console.error('Error deleting review:', err)
      setError(err.message)
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
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input 
                  type="search" 
                  placeholder="Search reviews..." 
                  className="w-[200px] pl-8 bg-white border-0 text-black placeholder:text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => setShowAddForm(true)}
              >
                Add New
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Reviews</CardTitle>
                <Package className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{reviews.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {reviews.length > 0 
                    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
                    : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Latest Review</CardTitle>
                <CalendarDays className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {reviews.length > 0 ? reviews[0]?.name?.[activeLanguage] || 'N/A' : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 flex justify-end">
            <Tabs defaultValue="en" value={activeLanguage} onValueChange={setActiveLanguage}>
              <TabsList className="bg-[#1F1F1F]">
                <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card className="bg-[#121212] border-0">
            <CardHeader>
              <CardTitle className="text-white">Available Reviews</CardTitle>
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
                <div className="relative overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#121212] z-10">
                      <tr className="border-b border-white/10">
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Image</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Name</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Trainer</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Quote</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Rating</th>
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-white">
                            No reviews found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((review) => (
                          <tr key={review._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4 text-sm">
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
                            <td className="p-4 text-sm font-medium text-white">
                              {review.name?.[activeLanguage] || review.name?.en || review.name?.ar || "—"}
                            </td>
                            <td className="p-4 text-sm text-white">
                              {review.trainerName?.[activeLanguage] || review.trainerName?.en || review.trainerName?.ar || "—"}
                            </td>
                            <td className="p-4 text-sm text-white">
                              {review.quote?.[activeLanguage] || review.quote?.en || review.quote?.ar || "—"}
                            </td>
                            <td className="p-4 text-sm text-white">
                              {review.rating || "—"}
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

      {/* Add Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-[#1F1F1F] text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new review with name, trainer, quote, rating and image
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid gap-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-4 bg-[#121212]">
                  <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                  <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name-en">Name (English)</Label>
                    <Input
                      id="name-en"
                      value={formData.name.en}
                      onChange={(e) => setFormData({
                        ...formData, 
                        name: {...formData.name, en: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trainer-name-en">Trainer Name (English)</Label>
                    <Input
                      id="trainer-name-en"
                      value={formData.trainerName.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        trainerName: {...formData.trainerName, en: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quote-en">Quote (English)</Label>
                    <Input
                      id="quote-en"
                      value={formData.quote.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        quote: {...formData.quote, en: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      required
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ar" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name-ar">Name (Arabic)</Label>
                    <Input
                      id="name-ar"
                      value={formData.name.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: {...formData.name, ar: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trainer-name-ar">Trainer Name (Arabic)</Label>
                    <Input
                      id="trainer-name-ar"
                      value={formData.trainerName.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        trainerName: {...formData.trainerName, ar: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quote-ar">Quote (Arabic)</Label>
                    <Input
                      id="quote-ar"
                      value={formData.quote.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        quote: {...formData.quote, ar: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({
                      ...formData,
                      rating: Number(e.target.value)
                    })}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Review Image</Label>
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor="file-upload" 
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-white/10 rounded-md cursor-pointer hover:border-white/20"
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
            <DialogFooter className="mt-4">
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Add Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-[#1F1F1F] text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the review details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateReview} className="space-y-4">
            <div className="grid gap-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-4 bg-[#121212]">
                  <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-black">English</TabsTrigger>
                  <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-black">Arabic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name-en">Name (English)</Label>
                    <Input
                      id="edit-name-en"
                      value={formData.name.en}
                      onChange={(e) => setFormData({
                        ...formData, 
                        name: {...formData.name, en: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-trainer-name-en">Trainer Name (English)</Label>
                    <Input
                      id="edit-trainer-name-en"
                      value={formData.trainerName.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        trainerName: {...formData.trainerName, en: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quote-en">Quote (English)</Label>
                    <Input
                      id="edit-quote-en"
                      value={formData.quote.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        quote: {...formData.quote, en: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      required
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ar" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name-ar">Name (Arabic)</Label>
                    <Input
                      id="edit-name-ar"
                      value={formData.name.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: {...formData.name, ar: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-trainer-name-ar">Trainer Name (Arabic)</Label>
                    <Input
                      id="edit-trainer-name-ar"
                      value={formData.trainerName.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        trainerName: {...formData.trainerName, ar: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quote-ar">Quote (Arabic)</Label>
                    <Input
                      id="edit-quote-ar"
                      value={formData.quote.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        quote: {...formData.quote, ar: e.target.value}
                      })}
                      className="bg-[#121212] border-white/10"
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
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-image">Review Image</Label>
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor="edit-file-upload" 
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-white/10 rounded-md cursor-pointer hover:border-white/20"
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
            <DialogFooter className="mt-4">
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Update Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
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
