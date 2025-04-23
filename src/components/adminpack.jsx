"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, Package, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSidebar } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "next-intl"
export default function PacksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [packs, setPacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPack, setSelectedPack] = useState(null)
  const locale = useLocale();
  const [formData, setFormData] = useState({
    startPrice: 0,
    category: {
      en: "Pack Single",
      ar: "باقة فردية"
    },
    sessions: [
      {
        price: 0,
        sessionCount: 1,
        expirationDays: 30
      }
    ],
    features: {
      en: [""],
      ar: [""]
    }
  })

  // State for dynamic session packages
  const [sessionPackages, setSessionPackages] = useState([
    { price: 0, sessionCount: 1, expirationDays: 30 }
  ])

  // State for dynamic features
  const [enFeatures, setEnFeatures] = useState([""])
  const [arFeatures, setArFeatures] = useState([""])

  useEffect(() => {
    fetchPacks()
  }, [])

  const fetchPacks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/packs')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch packs')
      }
      
      const data = await response.json()
      console.log("Packs data:", data)
      setPacks(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching packs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPack = async (e) => {
    e.preventDefault()
    try {
      // Prepare the form data with current session packages and features
      const packData = {
        ...formData,
        sessions: sessionPackages,
        features: {
          en: enFeatures.filter(feature => feature.trim() !== ""),
          ar: arFeatures.filter(feature => feature.trim() !== "")
        }
      }
      if (!packData.category || !packData.startPrice || packData.sessions.length === 0 || packData.features.en.length === 0 || packData.features.ar.length === 0) {
        throw new Error('All fields are required')
      }

      const response = await fetch('/api/packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData)
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add pack')
      }
      
      const data = await response.json()
      console.log("New pack created:", data)
      
      // Refresh the packs list
      await fetchPacks()
      
      // Reset form and close dialog
      setShowAddForm(false)
      resetForm()
    } catch (err) {
      console.error('Error adding pack:', err)
      setError(err.message)
    }
  }

  const handleUpdatePack = async (e) => {
    e.preventDefault()
    try {
      // Prepare the form data with current session packages and features
      const packData = {
        ...formData,
        sessions: sessionPackages,
        features: {
          en: enFeatures.filter(feature => feature.trim() !== ""),
          ar: arFeatures.filter(feature => feature.trim() !== "")
        }
      }

      if (!packData.category || packData.sessions.length === 0 || packData.features.en.length === 0 || packData.features.ar.length === 0) {
        throw new Error('All fields are required')
      }

      if (!selectedPack?._id) {
        throw new Error('No pack selected for update')
      }

      const response = await fetch(`/api/packs?id=${selectedPack._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update pack')
      }
      
      const data = await response.json()
      console.log("Pack updated:", data)
      
      // Update the packs state immediately with the new data
      setPacks(prevPacks => prevPacks.map(pack => 
        pack._id === selectedPack._id 
          ? {
              ...pack,
              ...packData
            }
          : pack
      ))
      
      setShowEditForm(false)
      setSelectedPack(null)
      resetForm()
      setError(null)
    } catch (err) {
      console.error('Error updating pack:', err)
      setError(err.message)
    }
  }

  const handleDeletePack = async () => {
    try {
      if (!selectedPack?._id) {
        throw new Error('No pack selected for deletion')
      }

      const response = await fetch(`/api/packs?id=${selectedPack._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete pack')
      }
      
      const data = await response.json()
      console.log("Pack deleted:", data)
      
      // Remove the deleted pack from state
      setPacks(prevPacks => prevPacks.filter(pack => pack._id !== selectedPack._id))
      
      setShowDeleteDialog(false)
      setSelectedPack(null)
    } catch (err) {
      console.error('Error deleting pack:', err)
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      startPrice: 0,
      category: {
        en: "Pack Single",
        ar: "باقة فردية"
      },
      sessions: [
        {
          price: 0,
          sessionCount: 1,
          expirationDays: 30
        }
      ],
      features: {
        en: [""],
        ar: [""]
      }
    })
    setSessionPackages([{ price: 0, sessionCount: 1, expirationDays: 30 }])
    setEnFeatures([""])
    setArFeatures([""])
  }

  // Helper function to get Arabic category name based on English category
  const getArabicCategory = (enCategory) => {
    switch (enCategory) {
      case "Pack Single":
        return "باقة فردية";
      case "Body Package":
        return "باقة الجسم";
      case "Pack Nutrition":
        return "باقة التغذية";
      default:
        return "باقة فردية";
    }
  }

  // Session package handlers
  const addSessionPackage = () => {
    setSessionPackages([...sessionPackages, { price: 0, sessionCount: 1, expirationDays: 30 }])
  }

  const removeSessionPackage = (index) => {
    if (sessionPackages.length > 1) {
      setSessionPackages(sessionPackages.filter((_, i) => i !== index))
    }
  }

  const updateSessionPackage = (index, field, value) => {
    const updated = [...sessionPackages]
    updated[index][field] = value
    setSessionPackages(updated)
  }

  // Feature handlers
  const addEnFeature = () => {
    setEnFeatures([...enFeatures, ""])
  }

  const removeEnFeature = (index) => {
    if (enFeatures.length > 1) {
      setEnFeatures(enFeatures.filter((_, i) => i !== index))
    }
  }

  const updateEnFeature = (index, value) => {
    const updated = [...enFeatures]
    updated[index] = value
    setEnFeatures(updated)
  }

  const addArFeature = () => {
    setArFeatures([...arFeatures, ""])
  }

  const removeArFeature = (index) => {
    if (arFeatures.length > 1) {
      setArFeatures(arFeatures.filter((_, i) => i !== index))
    }
  }

  const updateArFeature = (index, value) => {
    const updated = [...arFeatures]
    updated[index] = value
    setArFeatures(updated)
  }
  const filteredData = packs.filter((pack) => {
    const categoryEn = pack.category?.en || '';
    const categoryAr = pack.category?.ar || '';
    const features = [...(pack.features?.en || []), ...(pack.features?.ar || [])].join(' ');
    
    const searchFields = [
      categoryEn.toLowerCase(),
      categoryAr.toLowerCase(),
      features.toLowerCase()
    ];
    
    const query = searchQuery.toLowerCase();
    return searchFields.some((field) => field.includes(query));
  });
  // Count packs by category
  const singleCount = packs.filter(pack => pack.category?.en === 'Pack Single').length
  const packageCount = packs.filter(pack => pack.category?.en === 'Body Package').length
  const nutritionCount = packs.filter(pack => pack.category?.en=== 'Pack Nutrition').length

  return (
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Packs</h2>
          
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-gray-800 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-white mt-2 ">Single Sessions</CardTitle>
                <Package className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{singleCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">Body Packages</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{packageCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">Nutrition Packs</CardTitle>
                <Tag className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{nutritionCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t border-white/10 my-6"></div>

          <div className="flex items-end justify-end gap-3 m-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input 
                  type="search" 
                  placeholder="Search packs..." 
                  className="w-[200px] pl-8 bg-gray-300 text-black placeholder:text-black"
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
          <Card className="bg-gray-900 border-gray-800 border-0">
            <CardHeader>
              <CardTitle className="text-white mt-2">All Packs</CardTitle>
              <CardDescription className="text-white/60">Manage packs, pricing, and features</CardDescription>
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
                    <thead className="sticky top-0 bg-gray-900 border-gray-800 z-10">
                      <tr className="border-b border-white/10">
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Category</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Session Options</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Features (EN)</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Features (AR)</th>
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-white border-b border-white/10">
                            No packs found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((pack) => (
                          <tr key={pack._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4 text-sm font-medium text-white border-r border-white/10">
                              {pack.category?.[locale]}
                            </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              {pack.sessions.map((session, idx) => (
                                <div key={idx} className="mb-1">
                                  {session.sessionCount} sessions - ${session.price} ({session.expirationDays} days)
                                </div>
                              ))}
                            </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              <ul className="list-disc pl-4">
                                {pack.features?.en?.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              <ul className="list-disc pl-4">
                                {pack.features?.ar?.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
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
                                      setSelectedPack(pack)
                                      // Populate the form data
                                      setFormData({
                                        category: pack.category,
                                        sessions: pack.sessions,
                                        features: pack.features
                                      })
                                      // Set session packages and features
                                      setSessionPackages(pack.sessions)
                                      setEnFeatures(pack.features?.en || [""])
                                      setArFeatures(pack.features?.ar || [""])
                                      setShowEditForm(true)
                                    }}
                                  >
                                    Edit pack
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedPack(pack)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    Delete pack
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
            <DialogTitle>Add New Pack</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new pack with pricing and features
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPack}>
            <div className="grid gap-4 py-2">
              {/* Start Price */}
              <div>
                <Label htmlFor="startPrice">Start Price</Label>
                <Input
                  id="startPrice"
                  type="number"
                  value={formData.startPrice}
                  onChange={(e) => setFormData({...formData, startPrice: Number(e.target.value)})}
                  className="bg-[#121212] border-white/10 mt-1"
                  min="0"
                  required
                />
              </div>

              {/* Category Selection */}
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Label className="text-xs" htmlFor="category-en">English</Label>
                    <Input
                      id="category-en"
                      type="text"
                      value={formData.category.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: {
                          ...formData.category,
                          en: e.target.value
                        }
                      })}
                      className="bg-[#121212] border-white/10"
                      placeholder="Enter category in English"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs" htmlFor="category-ar">Arabic</Label>
                    <Input
                      id="category-ar"
                      type="text"
                      value={formData.category.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: {
                          ...formData.category,
                          ar: e.target.value
                        }
                      })}
                      className="bg-[#121212] border-white/10"
                      placeholder="أدخل الفئة بالعربية"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Session Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Session Options</Label>
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={addSessionPackage}
                  >
                    Add Option
                  </Button>
                </div>
                
                {sessionPackages.map((session, index) => (
                  <div key={index} className="bg-[#121212] p-3 rounded-md mb-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs" htmlFor={`price-${index}`}>Price ($)</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          value={session.price}
                          onChange={(e) => updateSessionPackage(index, 'price', Number(e.target.value))}
                          className="bg-[#1A1A1A] border-white/10 h-8 mt-1"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs" htmlFor={`sessions-${index}`}>Sessions</Label>
                        <Input
                          id={`sessions-${index}`}
                          type="number"
                          value={session.sessionCount}
                          onChange={(e) => updateSessionPackage(index, 'sessionCount', Number(e.target.value))}
                          className="bg-[#1A1A1A] border-white/10 h-8 mt-1"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs" htmlFor={`expiration-${index}`}>Expires (days)</Label>
                        <Input
                          id={`expiration-${index}`}
                          type="number"
                          value={session.expirationDays}
                          onChange={(e) => updateSessionPackage(index, 'expirationDays', Number(e.target.value))}
                          className="bg-[#1A1A1A] border-white/10 h-8 mt-1"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    {sessionPackages.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 mt-1 h-6 px-2 py-0"
                        onClick={() => removeSessionPackage(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Features Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* English Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Features (English)</Label>
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={addEnFeature}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {enFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Input
                          value={feature}
                          onChange={(e) => updateEnFeature(index, e.target.value)}
                          className="bg-[#121212] border-white/10 h-8"
                          placeholder="Enter feature"
                          required
                        />
                        {enFeatures.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                            onClick={() => removeEnFeature(index)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Arabic Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Features (Arabic)</Label>
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={addArFeature}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {arFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Input
                          value={feature}
                          onChange={(e) => updateArFeature(index, e.target.value)}
                          className="bg-[#121212] border-white/10 h-8"
                          placeholder="ادخل الميزة"
                          required
                        />
                        {arFeatures.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                            onClick={() => removeArFeature(index)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-white text-black">
                Add Pack
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-[#1F1F1F] text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pack</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the pack details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePack}>
            <div className="grid gap-4 py-2">
              {/* Category Selection */}
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Label className="text-xs" htmlFor="category-en">English</Label>
                    <Input
                      id="category-en"
                      type="text"
                      value={formData.category.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: {
                          ...formData.category,
                          en: e.target.value
                        }
                      })}
                      className="bg-[#121212] border-white/10"
                      placeholder="Enter category in English"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs" htmlFor="category-ar">Arabic</Label>
                    <Input
                      id="category-ar"
                      type="text"
                      value={formData.category.ar}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: {
                          ...formData.category,
                          ar: e.target.value
                        }
                      })}
                      className="bg-[#121212] border-white/10"
                      placeholder="أدخل الفئة بالعربية"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Session Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Session Options</Label>
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={addSessionPackage}
                  >
                    Add Option
                  </Button>
                </div>
                
                {sessionPackages.map((session, index) => (
                  <div key={index} className="bg-[#121212] p-3 rounded-md mb-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs" htmlFor={`edit-price-${index}`}>Price ($)</Label>
                        <Input
                          id={`edit-price-${index}`}
                          type="number"
                          value={session.price}
                          onChange={(e) => updateSessionPackage(index, 'price', Number(e.target.value))}
                          className="bg-[#1A1A1A] border-white/10 h-8 mt-1"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs" htmlFor={`edit-sessions-${index}`}>Sessions</Label>
                        <Input
                          id={`edit-sessions-${index}`}
                          type="number"
                          value={session.sessionCount}
                          onChange={(e) => updateSessionPackage(index, 'sessionCount', Number(e.target.value))}
                          className="bg-[#1A1A1A] border-white/10 h-8 mt-1"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs" htmlFor={`edit-expiration-${index}`}>Expires (days)</Label>
                        <Input
                          id={`edit-expiration-${index}`}
                          type="number"
                          value={session.expirationDays}
                          onChange={(e) => updateSessionPackage(index, 'expirationDays', Number(e.target.value))}
                          className="bg-[#1A1A1A] border-white/10 h-8 mt-1"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    {sessionPackages.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 mt-1 h-6 px-2 py-0"
                        onClick={() => removeSessionPackage(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Features Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* English Features */}
                <div>
                <div className="flex items-center justify-between mb-2">
                <Label>Features (English)</Label>
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={addEnFeature}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {enFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={feature}
                      onChange={(e) => updateEnFeature(index, e.target.value)}
                      className="bg-[#121212] border-white/10 h-8"
                      placeholder="Enter feature"
                      required
                    />
                    {enFeatures.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                        onClick={() => removeEnFeature(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Arabic Features */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Features (Arabic)</Label>
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={addArFeature}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {arFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={feature}
                      onChange={(e) => updateArFeature(index, e.target.value)}
                      className="bg-[#121212] border-white/10 h-8"
                      placeholder="ادخل الميزة"
                      required
                    />
                    {arFeatures.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                        onClick={() => removeArFeature(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="ghost" onClick={() => setShowEditForm(false)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-white text-black">
            Update Pack
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  {/* Delete Confirmation Dialog */}
  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
    <DialogContent className="bg-[#1F1F1F] text-white">
      <DialogHeader>
        <DialogTitle>Delete Pack</DialogTitle>
        <DialogDescription className="text-white/60">
          Are you sure you want to delete this pack? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-4">
        <Button type="button" variant="ghost" onClick={() => setShowDeleteDialog(false)}>
          Cancel
        </Button>
        <Button 
          type="button" 
          className="bg-red-500 hover:bg-red-600"
          onClick={handleDeletePack}
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
  )}