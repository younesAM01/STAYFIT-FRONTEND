"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, Calendar, CalendarDays, User, Search, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSidebar } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sessions, setSessions] = useState([])
  const [coaches, setCoaches] = useState([])
  const [clients, setClients] = useState([])
  const [packs, setPacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [formData, setFormData] = useState({
    client: "",
    coach: "",
    pack: "",
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: "09:00",
    location: "",
    duration: 60,
    status: "scheduled"
  })

  useEffect(() => {
    // Load all data needed for the page
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchSessions(),
          fetchCoaches(),
          fetchClients(),
          fetchPacks()
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/session')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch sessions')
      }
      
      const data = await response.json()
      console.log("Sessions data:", data)
      setSessions(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching sessions:', err)
      throw err
    }
  }

  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/users?role=coach')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch coaches')
      }
      
      const data = await response.json()
      console.log("Coaches data:", data)
      setCoaches(data)
      return data
    } catch (err) {
      console.error('Error fetching coaches:', err)
      throw err
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/users?role=client')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch clients')
      }
      
      const data = await response.json()
      console.log("Clients data:", data)
      setClients(data)
      return data
    } catch (err) {
      console.error('Error fetching clients:', err)
      throw err
    }
  }

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/packs')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch packs')
      }
      
      const data = await response.json()
      console.log("Packs data:", data)
      setPacks(data)
      return data
    } catch (err) {
      console.error('Error fetching packs:', err)
      throw err
    }
  }

  // Improved helper functions for name lookups with better error handling and debugging
  const getClientName = (clientId) => {
    if (!clientId) return 'No Client';
    if (!clients || clients.length === 0) return 'Loading...';
    
    // Ensure both IDs are strings for comparison
    const clientIdStr = String(clientId);
    
    // Find the client by ID
    const client = clients.find(c => String(c._id) === clientIdStr);
    
    // Debug logging for troubleshooting
    if (!client) {
      console.log(`Client with ID ${clientIdStr} not found among ${clients.length} clients`);
    }
    
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  }

  const getCoachName = (coachId) => {
    if (!coachId) return 'No Coach';
    if (!coaches || coaches.length === 0) return 'Loading...';
    
    // Ensure both IDs are strings for comparison
    const coachIdStr = String(coachId);
    
    // Find the coach by ID
    const coach = coaches.find(c => String(c._id) === coachIdStr);
    
    // Debug logging for troubleshooting
    if (!coach) {
      console.log(`Coach with ID ${coachIdStr} not found among ${coaches.length} coaches`);
    }
    
    return coach ? `${coach.firstName} ${coach.lastName}` : 'Unknown Coach';
  }

  const getPackName = (packId) => {
    if (!packId) return 'No Pack';
    if (!packs || packs.length === 0) return 'Loading...';
    
    // Ensure both IDs are strings for comparison
    const packIdStr = String(packId);
    
    // Find the pack by ID
    const pack = packs.find(p => String(p._id) === packIdStr);
    
    // Debug logging for troubleshooting
    if (!pack) {
      console.log(`Pack with ID ${packIdStr} not found among ${packs.length} packs`);
      if (packs.length > 0) {
        console.log("Available pack IDs:", packs.map(p => p._id));
      }
    }
    
    // Check both name and category fields
    return pack ? (pack.name || pack.category || 'Unnamed Pack') : 'Unknown Pack';
  }

  const handleAddSession = async (e) => {
    e.preventDefault()
    try {
      if (!formData.client || !formData.coach || !formData.pack || !formData.sessionDate || !formData.sessionTime || !formData.location) {
        throw new Error('All fields are required')
      }

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add session')
      }
      
      const data = await response.json()
      console.log("New session created:", data)
      
      // Refresh the sessions list
      await fetchSessions()
      
      // Reset form and close dialog
      setShowAddForm(false)
      setFormData({
        client: "",
        coach: "",
        pack: "",
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: "09:00",
        location: "",
        duration: 60,
        status: "scheduled"
      })
    } catch (err) {
      console.error('Error adding session:', err)
      setError(err.message)
    }
  }

  const handleUpdateSession = async (e) => {
    e.preventDefault()
    try {
      if (!formData.client || !formData.coach || !formData.pack || !formData.sessionDate || !formData.sessionTime || !formData.location) {
        throw new Error('All fields are required')
      }

      if (!selectedSession?._id) {
        throw new Error('No session selected for update')
      }

      const response = await fetch(`/api/session?id=${selectedSession._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update session')
      }
      
      const data = await response.json()
      console.log("Session updated:", data)
      
      // Update the sessions state immediately with the new data
      setSessions(prevSessions => prevSessions.map(session => 
        session._id === selectedSession._id 
          ? {
              ...session,
              ...formData
            }
          : session
      ))
      
      setShowEditForm(false)
      setSelectedSession(null)
      setError(null)
    } catch (err) {
      console.error('Error updating session:', err)
      setError(err.message)
    }
  }

  const handleDeleteSession = async () => {
    try {
      if (!selectedSession?._id) {
        throw new Error('No session selected for deletion')
      }

      const response = await fetch(`/api/session?id=${selectedSession._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete session')
      }
      
      const data = await response.json()
      console.log("Session deleted:", data)
      
      // Remove the deleted session from state
      setSessions(prevSessions => prevSessions.filter(session => session._id !== selectedSession._id))
      
      setShowDeleteDialog(false)
      setSelectedSession(null)
    } catch (err) {
      console.error('Error deleting session:', err)
      setError(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-500'
      case 'completed':
        return 'text-green-500'
      case 'canceled':
        return 'text-red-500'
      default:
        return 'text-white'
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (err) {
      console.error("Error formatting date:", err)
      return "Invalid date"
    }
  }

  const filteredData = sessions.filter((session) => {
    const clientName = getClientName(session.client) || ''; 
    const coachName = getCoachName(session.coach) || '';
    const packName = getPackName(session.pack) || '';
    const location = session.location || '';
    const status = session.status || '';
    
    const searchFields = [
      clientName.toLowerCase(),
      coachName.toLowerCase(),
      packName.toLowerCase(),
      location.toLowerCase(),
      status.toLowerCase()
    ];
    
    const query = searchQuery.toLowerCase();
    return searchFields.some((field) => field.includes(query));
  });

  // Count sessions by status
  const scheduledCount = sessions.filter(session => session.status === 'scheduled').length
  const completedCount = sessions.filter(session => session.status === 'completed').length
  const canceledCount = sessions.filter(session => session.status === 'canceled').length

  // Get today's sessions
  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate).toISOString().split('T')[0]
    return sessionDate === today
  })

  return (
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Sessions</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input 
                  type="search" 
                  placeholder="Search sessions..." 
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Scheduled Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{scheduledCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Completed Sessions</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Today's Sessions</CardTitle>
                <CalendarDays className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todaySessions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#121212] border-0">
            <CardHeader>
              <CardTitle className="text-white">All Sessions</CardTitle>
              <CardDescription className="text-white/60">Manage sessions, schedules, and appointments</CardDescription>
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
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Client</th>
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Coach</th>
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Pack</th>
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Date</th>
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Time</th>
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Location</th>
      <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Status</th>
      <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredData.length === 0 ? (
      <tr>
        <td colSpan="8" className="p-4 text-center text-white">
          No sessions found
        </td>
      </tr>
    ) : (
      filteredData.map((session) => (
        <tr key={session._id} className="border-b border-white/10 hover:bg-white/5">
          <td className="p-4 text-sm font-medium text-white">
            {getClientName(session.client)}
          </td>
          <td className="p-4 text-sm text-white">
            {getCoachName(session.coach)}
          </td>
          <td className="p-4 text-sm text-white">
            {getPackName(session.pack)}
          </td>
          <td className="p-4 text-sm text-white">
            {formatDate(session.sessionDate)}
          </td>
          <td className="p-4 text-sm text-white">
            {session.sessionTime}
          </td>
          <td className="p-4 text-sm text-white">
            {session.location}
          </td>
          <td className={`p-4 text-sm ${getStatusColor(session.status)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
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
                    setSelectedSession(session)
                    setFormData({
                      client: session.client,
                      coach: session.coach,
                      pack: session.pack,
                      sessionDate: new Date(session.sessionDate).toISOString().split('T')[0],
                      sessionTime: session.sessionTime,
                      location: session.location,
                      duration: session.duration,
                      status: session.status
                    })
                    setShowEditForm(true)
                  }}
                >
                  Edit session
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="text-red-500"
                  onClick={() => {
                    setSelectedSession(session)
                    setShowDeleteDialog(true)
                  }}
                >
                  Delete session
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
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Add New Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Schedule a new training session
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSession}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select 
                    value={formData.client} 
                    onValueChange={(value) => setFormData({...formData, client: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coach">Coach</Label>
                  <Select 
                    value={formData.coach} 
                    onValueChange={(value) => setFormData({...formData, coach: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      {coaches.map((coach) => (
                        <SelectItem key={coach._id} value={coach._id}>
                          {coach.firstName} {coach.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pack">Pack</Label>
                <Select 
                  value={formData.pack} 
                  onValueChange={(value) => setFormData({...formData, pack: value})}
                >
                  <SelectTrigger className="bg-[#121212] border-white/10">
                    <SelectValue placeholder="Select pack" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F1F1F] border-white/10">
                    {packs.map((pack) => (
                      <SelectItem key={pack._id} value={pack._id}>
                        {pack.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sessionDate">Date</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({...formData, sessionDate: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sessionTime">Time</Label>
                  <Input
                    id="sessionTime"
                    type="time"
                    value={formData.sessionTime}
                    onChange={(e) => setFormData({...formData, sessionTime: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="bg-[#121212] border-white/10"
                  placeholder="Gym A, Room 2 or Online (Zoom)"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="bg-[#121212] border-white/10"
                    min="15"
                    step="15"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Add Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the session details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSession}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-client">Client</Label>
                  <Select 
                    value={formData.client} 
                    onValueChange={(value) => setFormData({...formData, client: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-coach">Coach</Label>
                  <Select 
                    value={formData.coach} 
                    onValueChange={(value) => setFormData({...formData, coach: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      {coaches.map((coach) => (
                        <SelectItem key={coach._id} value={coach._id}>
                          {coach.firstName} {coach.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pack">Pack</Label>
                <Select 
                  value={formData.pack} 
                  onValueChange={(value) => setFormData({...formData, pack: value})}
                >
                  <SelectTrigger className="bg-[#121212] border-white/10">
                    <SelectValue placeholder="Select pack" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F1F1F] border-white/10">
                    {packs.map((pack) => (
                      <SelectItem key={pack._id} value={pack._id}>
                        {pack.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-sessionDate">Date</Label>
                  <Input
                    id="edit-sessionDate"
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({...formData, sessionDate: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-sessionTime">Time</Label>
                  <Input
                    id="edit-sessionTime"
                    type="time"
                    value={formData.sessionTime}
                    onChange={(e) => setFormData({...formData, sessionTime: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="bg-[#121212] border-white/10"
                  placeholder="Gym A, Room 2 or Online (Zoom)"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="bg-[#121212] border-white/10"
                    min="15"
                    step="15"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Update Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this session? This action cannot be undone.
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
              onClick={handleDeleteSession}
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