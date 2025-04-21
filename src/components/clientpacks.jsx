"use client"

import { useState, useEffect, useMemo } from "react"
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
import { useLocale } from "next-intl"
import { useAuth } from "@/context/authContext"


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
  const { mongoUser } = useAuth()
  const locale = useLocale()
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

  const [clientsCache, setClientsCache] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      // Fetch all data in parallel
      Promise.all([
        fetchClientPacks(),
        fetchClients(),
        fetchPacks()
      ]).finally(() => {
        setIsInitialLoad(false);
      });
    }
  }, [isInitialLoad]);

  const fetchClientName = async (clientId) => {
    try {
      if (!clientId) {
        return 'N/A';
      }

      // Check cache first
      if (clientsCache[clientId]) {
        return clientsCache[clientId];
      }

      const response = await fetch(`/api/users?id=${clientId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return 'N/A';
        }
        return 'N/A';
      }
      
      const data = await response.json();
      
      if (!data || !data.firstName || !data.lastName) {
        return 'N/A';
      }
      
      if (data.role !== 'client') {
        return 'N/A';
      }
      
      const fullName = `${data.firstName} ${data.lastName}`;
      // Cache the result
      setClientsCache(prev => ({
        ...prev,
        [clientId]: fullName
      }));
      
      return fullName;
    } catch (err) {
      return 'N/A';
    }
  };

  const fetchClientPacks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/client-pack');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client packs');
      }

      // Process packs in parallel and check expiration dates
      const packsWithNames = await Promise.all(
        data.map(async (pack) => {
          try {
            const clientName = await fetchClientName(pack.client);
            const today = new Date();
            const expirationDate = new Date(pack.expirationDate);

            // If pack is expired and still pending, update it to completed
            if (expirationDate <= today && pack.purchaseState === 'pending') {
              try {
                const updateResponse = await fetch(`/api/client-pack?id=${pack._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ...pack,
                    purchaseState: 'completed'
                  })
                });

                if (!updateResponse.ok) {
                  console.error('Failed to update expired pack status');
                }
              } catch (updateErr) {
                console.error('Error updating expired pack:', updateErr);
              }
            }

            return {
              ...pack,
              clientName,
              // Update the purchaseState in the UI if it's expired
              purchaseState: expirationDate <= today ? 'completed' : pack.purchaseState
            };
          } catch (err) {
            return {
              ...pack,
              clientName: 'N/A'
            };
          }
        })
      );
      
      setClientPacks(packsWithNames);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/users?role=client');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch clients');
      }
      
      const clientsWithFullName = data
        .filter(user => user.role === 'client')
        .map(client => ({
          ...client,
          fullName: `${client.firstName} ${client.lastName}`
        }));
      
      setClients(clientsWithFullName);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/packs');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch packs');
      }
      
      setPacks(data);
    } catch (err) {
      console.error('Error fetching packs:', err);
      setError(err.message);
    }
  };

  const getPackDisplayInfo = (pack) => {
    if (!pack) return 'N/A'
    return `${pack.category?.[locale]} - ${pack.sessions[0]?.sessionCount || 0} sessions`
  }

  const getPendingCount = () => {
    return clientPacks.filter(pack => pack.purchaseState === 'pending').length;
  };

  const getCompletedCount = () => {
    return clientPacks.filter(pack => pack.purchaseState === 'completed').length;
  };

  const handleAddNewPack = async (e) => {
    e.preventDefault();
    try {
      if (!formData.client || !formData.pack) {
        throw new Error('Client and Package are required');
      }

      if (!mongoUser?._id) {
        throw new Error('User not authenticated');
      }

      // Calculate expiration date based on the selected pack's expirationDays
      const selectedPack = packs.find(p => p._id === formData.pack);
      const expirationDays = selectedPack?.sessions[0]?.expirationDays || 30;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      const packData = {
        client: formData.client,
        pack: formData.pack,
        packPrice: formData.packPrice,
        remainingSessions: formData.remainingSessions,
        purchaseState: formData.purchaseState,
        expirationDate: expirationDate.toISOString(),
        purchaseDate: new Date().toISOString()
      };

      // Close the form immediately
      setShowAddForm(false);
      setFormData({
        client: "",
        pack: "",
        packPrice: 0,
        expirationDate: "",
        remainingSessions: 0,
        purchaseState: "pending"
      });

      // Make the API call after closing the form
      const response = await fetch('/api/client-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add new pack');
      }
      
      // Refresh the data after successful addition
      await fetchClientPacks();
    } catch (err) {
      console.error('Error adding new pack:', err);
      setError(err.message);
    }
  };

  const handleUpdatePack = async (e) => {
    e.preventDefault();
    try {
      if (!selectedPack?._id) {
        throw new Error('No pack selected for update');
      }

      const packData = {
        ...formData,
        expirationDate: new Date(formData.expirationDate).toISOString()
      };

      // Close the form immediately
      setShowEditForm(false);
      setSelectedPack(null);

      const response = await fetch(`/api/client-pack?id=${selectedPack._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update pack');
      }
      
      // Refresh the data after successful update
      await fetchClientPacks();
    } catch (err) {
      console.error('Error updating pack:', err);
      setError(err.message);
    }
  };

  const handleDeletePack = async () => {
    try {
      if (!selectedPack?._id) {
        throw new Error('No pack selected for deletion');
      }

      // Close the dialog immediately
      setShowDeleteDialog(false);
      setSelectedPack(null);

      const response = await fetch(`/api/client-pack?id=${selectedPack._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete pack');
      }
      
      // Refresh the data after successful deletion
      await fetchClientPacks();
    } catch (err) {
      console.error('Error deleting pack:', err);
      setError(err.message);
    }
  };

  // Optimize the filtered data calculation
  const filteredData = useMemo(() => {
    return clientPacks.filter((pack) => {
      const searchFields = [
        pack.clientName?.toLowerCase() || '',
        pack.pack?.category?.[locale].toLowerCase() || '',
        String(pack.packPrice).toLowerCase(),
        pack.purchaseState?.toLowerCase() || '',
      ];
      const query = searchQuery.toLowerCase();
      return searchFields.some((field) => field.includes(query));
    });
  }, [clientPacks, searchQuery, locale]);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Active Packages</CardTitle>
                <Package className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{clientPacks.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Pending Packages</CardTitle>
                <CalendarDays className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{getPendingCount()}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Completed Packages</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{getCompletedCount()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-col items-end">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  type="search" 
                  placeholder="Search client packs..." 
                  className="w-[200px] pl-8 bg-gray-300 border-0 text-black placeholder:text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="bg-[#B4E90E] text-black hover:bg-[#A0D50C] cursor-pointer"
                onClick={() => {
                  setShowAddForm(true)
                }}
              >
                Add New
              </Button>
            </div>
          </div>

          <Card className="bg-gray-900 border-0">
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
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="border-b border-white/20">
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/20">Client</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/20">Package</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/20">Price</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/20">Sessions Left</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/20">Status</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/20">Expiration</th>
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((pack) => (
                        <tr key={pack._id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4 text-sm font-medium text-white border-r border-white/20">
                            {pack.clientName}
                          </td>
                          <td className="p-4 text-sm text-white border-r border-white/20">
                            {getPackDisplayInfo(pack.pack)}
                          </td>
                          <td className="p-4 text-sm text-white border-r border-white/20">
                            ${pack.packPrice}
                          </td>
                          <td className="p-4 text-sm text-white border-r border-white/20">
                            {pack.remainingSessions}
                          </td>
                          <td className="p-4 text-sm text-white border-r border-white/20">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pack.purchaseState === 'completed' ? 'bg-green-500/20 text-green-500' :
                              pack.purchaseState === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {pack.purchaseState}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-white border-r border-white/20">
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
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.fullName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No clients available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pack">Package</Label>
                <Select
                  value={formData.pack}
                  onValueChange={(value) => {
                    const selectedPack = packs.find(p => p._id === value);
                    if (selectedPack) {
                      const firstSession = selectedPack.sessions[0] || {};
                      setFormData({
                        ...formData,
                        pack: value,
                        packPrice: firstSession.price || 0,
                        remainingSessions: firstSession.sessionCount || 0
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packs.map((pack) => (
                      <SelectItem key={pack._id} value={pack._id}>
                        {`${pack.category?.[locale]} - ${pack.sessions[0]?.sessionCount || 0} sessions`}
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
              <Button type="submit" className="bg-[#B4E90E] text-black hover:bg-[#A0D50C]">
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
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remainingSessions">Remaining Sessions</Label>
                <Input
                  id="remainingSessions"
                  type="number"
                  value={formData.remainingSessions}
                  onChange={(e) => setFormData({...formData, remainingSessions: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate ? new Date(formData.expirationDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
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
              <Button type="submit" className="bg-[#B4E90E] text-black hover:bg-[#A0D50C]">
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
          {error && (
            <div className="text-red-500 text-sm mb-4">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteDialog(false)
                setError(null)
              }}
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