"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, MoreHorizontal, Package, CalendarDays, User, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSidebar } from "@/components/ui/sidebar"



export default function ClientPacksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clientPacks, setClientPacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPack, setSelectedPack] = useState(null)
  const [formData, setFormData] = useState({
    client: "",
    pack: "",
    packPrice: 0,
    expirationDate: "",
    remainingSessions: 0,
    purchaseState: "pending"
  })

  // Add state for clients and packs lists
  const [clients, setClients] = useState([])
  const [packs, setPacks] = useState([])

  useEffect(() => {
    fetchClientPacks()
    fetchClients()
    fetchPacks()
  }, [])

  const fetchClientName = async (clientId) => {
    try {
      const response = await fetch(`/api/users?id=${clientId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client')
      }
      
      return `${data.firstName} ${data.lastName}` || 'N/A'
    } catch (err) {
      console.error('Error fetching client:', err)
      return 'N/A'
    }
  }

  const fetchClientPacks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/client-pack')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client packs')
      }

      // Fetch client names for each pack
      const packsWithNames = await Promise.all(
        data.map(async (pack) => {
          const clientName = await fetchClientName(pack.client)
          return {
            ...pack,
            clientName
          }
        })
      )
      
      setClientPacks(packsWithNames)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching client packs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/users?role=client')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch clients')
      }
      
      // Transform the data to include full name
      const clientsWithFullName = data.map(client => ({
        ...client,
        fullName: `${client.firstName} ${client.lastName}`
      }))
      
      setClients(clientsWithFullName)
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err.message)
    }
  }

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/packs')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch packs')
      }
      
      setPacks(data)
    } catch (err) {
      console.error('Error fetching packs:', err)
      setError(err.message)
    }
  }

  const getPackDisplayInfo = (pack) => {
    if (!pack) return 'N/A'
    return `${pack.category} - ${pack.sessions[0]?.sessionCount || 0} sessions`
  }

  const handleAddNewPack = async (e) => {
    e.preventDefault()
    try {
      if (!formData.client || !formData.pack) {
        throw new Error('Client and Package are required')
      }

      // Calculate expiration date based on the selected pack's expirationDays
      const selectedPack = packs.find(p => p._id === formData.pack)
      const expirationDays = selectedPack?.sessions[0]?.expirationDays || 30
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + expirationDays)

      const packData = {
        client: formData.client,
        pack: formData.pack,
        packPrice: formData.packPrice,
        remainingSessions: formData.remainingSessions,
        purchaseState: formData.purchaseState,
        expirationDate: expirationDate.toISOString(),
        purchaseDate: new Date().toISOString()
      }

      console.log('Sending pack data:', packData) // Debug log

      const response = await fetch('/api/client-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add new pack')
      }
      
      await fetchClientPacks()
      setShowAddForm(false)
      setFormData({
        client: "",
        pack: "",
        packPrice: 0,
        expirationDate: "",
        remainingSessions: 0,
        purchaseState: "pending"
      })
    } catch (err) {
      console.error('Error adding new pack:', err)
      setError(err.message)
    }
  }

  const handleUpdatePack = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/client-pack?id=${selectedPack._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update pack')
      }
      
      await fetchClientPacks()
      setShowEditForm(false)
      setSelectedPack(null)
    } catch (err) {
      console.error('Error updating pack:', err)
    }
  }

  const handleDeletePack = async () => {
    try {
      if (!selectedPack?._id) {
        throw new Error('No pack selected for deletion')
      }

      // Log the ID we're trying to delete
      console.log('Attempting to delete pack with ID:', selectedPack._id)

      // Using query parameter format that matches the backend
      const response = await fetch(`/api/client-pack`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: selectedPack._id })
      })

      // Log the response status
      console.log('Delete response status:', response.status)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error('Failed to parse server response')
      }

      // Log the response data
      console.log('Delete response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete pack')
      }

      await fetchClientPacks()
      setShowDeleteDialog(false)
      setSelectedPack(null)
    } catch (err) {
      console.error('Full error details:', err)
      setError(err.message)
      // Keep the dialog open on error
    }
  }

  const filteredData = clientPacks.filter((pack) => {
    const searchFields = [
      pack.clientName?.toLowerCase() || '',
      pack.pack?.category?.toLowerCase() || '',
      String(pack.packPrice).toLowerCase(),
      pack.purchaseState?.toLowerCase() || '',
    ]
    const query = searchQuery.toLowerCase()
    return searchFields.some((field) => field.includes(query))
  })

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Client Packs</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input 
                  type="search" 
                  placeholder="Search client packs..." 
                  className="w-[200px] pl-8 bg-white border-0 text-black placeholder:text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => {
                  setShowAddForm(true)
                }}
              >
                Add New
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Active Packages</CardTitle>
                <Package className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{clientPacks.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Expiring This Week</CardTitle>
                <CalendarDays className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{clientPacks.filter(pack => pack.status === "Expiring Soon").length}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">New Subscriptions</CardTitle>
                <User className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">+{clientPacks.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#121212] border-0">
            <CardHeader>
              <CardTitle className="text-white">Active Client Packages</CardTitle>
              <CardDescription className="text-white/60">Manage all client packages and subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-white">Loading...</div>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#121212] z-10">
                      <tr className="border-b border-white/10">
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Client</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Package</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Price</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Sessions Left</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Status</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Expiration</th>
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((pack) => (
                        <tr key={pack._id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4 text-sm font-medium text-white">
                            {pack.clientName}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {getPackDisplayInfo(pack.pack)}
                          </td>
                          <td className="p-4 text-sm text-white">
                            ${pack.packPrice}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {pack.remainingSessions}
                          </td>
                          <td className="p-4 text-sm text-white">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pack.purchaseState === 'completed' ? 'bg-green-500/20 text-green-500' :
                              pack.purchaseState === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {pack.purchaseState}
                            </span>
                          </td>
                            <td className="p-4 text-sm text-white">
                            {new Date(pack.expirationDate).toLocaleDateString()}
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
                                    setFormData({
                                      client: pack.client,
                                      pack: pack.pack?._id || pack.pack,
                                      packPrice: pack.packPrice,
                                      expirationDate: new Date(pack.expirationDate).toISOString().split('T')[0],
                                      remainingSessions: pack.remainingSessions,
                                      purchaseState: pack.purchaseState
                                    })
                                    setShowEditForm(true)
                                    }}
                                  >
                                    Edit package
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                  onClick={() => {
                                    setSelectedPack(pack)
                                    setShowDeleteDialog(true)
                                  }}
                                  >
                                    Delete package
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                      ))}
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
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Add New Client Package</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new package subscription for a client
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewPack}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => setFormData({...formData, client: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pack">Package</Label>
                <Select
                  value={formData.pack}
                  onValueChange={(value) => {
                    const selectedPack = packs.find(p => p._id === value)
                    if (selectedPack) {
                      const firstSession = selectedPack.sessions[0] || {}
                      setFormData({
                        ...formData,
                        pack: value,
                        packPrice: firstSession.price || 0,
                        remainingSessions: firstSession.sessionCount || 0
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packs.map((pack) => (
                      <SelectItem key={pack._id} value={pack._id}>
                        {`${pack.category} - ${pack.sessions[0]?.sessionCount || 0} sessions`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="packPrice">Price</Label>
                <Input
                  id="packPrice"
                  type="number"
                  value={formData.packPrice}
                  onChange={(e) => setFormData({...formData, packPrice: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remainingSessions">Number of Sessions</Label>
                <Input
                  id="remainingSessions"
                  type="number"
                  value={formData.remainingSessions}
                  onChange={(e) => setFormData({...formData, remainingSessions: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseState">Status</Label>
                <Select
                  value={formData.purchaseState}
                  onValueChange={(value) => setFormData({...formData, purchaseState: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Add Package
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Edit Client Package</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the package subscription details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePack}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="packPrice">Price</Label>
                <Input
                  id="packPrice"
                  type="number"
                  value={formData.packPrice}
                  onChange={(e) => setFormData({...formData, packPrice: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remainingSessions">Remaining Sessions</Label>
                <Input
                  id="remainingSessions"
                  type="number"
                  value={formData.remainingSessions}
                  onChange={(e) => setFormData({...formData, remainingSessions: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseState">Status</Label>
                <Select
                  value={formData.purchaseState}
                  onValueChange={(value) => setFormData({...formData, purchaseState: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Update Package
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this package? This action cannot be undone.
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
              onClick={handleDeletePack}
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