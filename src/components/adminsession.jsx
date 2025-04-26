"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, Calendar, CalendarDays, User, Search, Clock, MapPin, ChevronRight, ChevronLeft, Info, Mail, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSidebar } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "next-intl"
export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sessions, setSessions] = useState([])
  const [coaches, setCoaches] = useState([])
  const [clients, setClients] = useState([])
  const [packs, setPacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const locale = useLocale()
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()))
  const [hoveredSession, setHoveredSession] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [showSessionInfo, setShowSessionInfo] = useState(false)
  const [selectedCalendarSession, setSelectedCalendarSession] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const hours = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM
  const weekDays = getWeekDays(currentWeekStart)
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/session')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch sessions')
      }
      
      const data = await response.json()
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
      setCoaches(data.filter(user => user.role === 'coach'))
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
      setClients(data.filter(user => user.role === 'client'))
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
    return pack ? (pack.name || pack.category?.[locale] || 'Unnamed Pack') : 'Unknown Pack';
  }

  const handleUpdateSession = async (e) => {
    e.preventDefault()
    try {
      if (!selectedSession?._id) {
        throw new Error('No session selected for update')
      }

      // Create an object with only the changed fields
      const changedFields = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== selectedSession[key]) {
          changedFields[key] = formData[key]
        }
      })

      // If no fields were changed, return early
      if (Object.keys(changedFields).length === 0) {
        setShowEditForm(false)
        return
      }

      const response = await fetch(`/api/session?id=${selectedSession._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...changedFields,
          sessionDate: formData.sessionDate ? new Date(formData.sessionDate).toISOString() : undefined
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update session')
      }
      
      const updatedSession = await response.json()

      // Update the sessions state with the new data
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(session => 
          session._id === selectedSession._id 
            ? {
                ...session,
                ...changedFields,
                sessionDate: formData.sessionDate, // Ensure the date is updated
                sessionTime: formData.sessionTime, // Ensure the time is updated
                client: updatedSession.client || session.client,
                coach: updatedSession.coach || session.coach,
                pack: updatedSession.pack || session.pack
              }
            : session
        )
        return updatedSessions
      })
      
      // Close the edit form and reset states
      setShowEditForm(false)
      setSelectedSession(null)
      setError(null)

      // If the updated session was being viewed in the calendar, update that too
      if (selectedCalendarSession?._id === selectedSession._id) {
        setSelectedCalendarSession(prev => ({
          ...prev,
          ...changedFields,
          sessionDate: formData.sessionDate, // Ensure the date is updated
          sessionTime: formData.sessionTime, // Ensure the time is updated
          client: updatedSession.client || prev.client,
          coach: updatedSession.coach || prev.coach,
          pack: updatedSession.pack || prev.pack
        }))
      }

      // Force a re-render of the calendar by updating the week if the date changed
      const updatedDate = new Date(formData.sessionDate)
      const currentWeekStartDate = new Date(currentWeekStart)
      const updatedWeekStart = getWeekStartDate(updatedDate)
      
      if (updatedWeekStart.getTime() !== currentWeekStartDate.getTime()) {
        setCurrentWeekStart(updatedWeekStart)
      }

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
      
      // Remove the deleted session from all relevant states
      setSessions(prevSessions => prevSessions.filter(session => session._id !== selectedSession._id))
      
      // If the deleted session was being viewed in the calendar, clear it
      if (selectedCalendarSession?._id === selectedSession._id) {
        setSelectedCalendarSession(null)
        setShowSessionInfo(false)
      }
      
      // Close the delete dialog and clear selection
      setShowDeleteDialog(false)
      setSelectedSession(null)
      setError(null)
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

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCurrentWeekStart(nextWeek)
  }

  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart)
    previousWeek.setDate(previousWeek.getDate() - 7)
    setCurrentWeekStart(previousWeek)
  }

  const goToToday = () => {
    setCurrentWeekStart(getWeekStartDate(new Date()))
  }

  const getSessionHour = (sessionTime) => {
    const timeMatch = sessionTime.match(/(\d+)([AP]M)/)
    if (!timeMatch) return null

    let hour = parseInt(timeMatch[1], 10)
    const meridian = timeMatch[2]

    if (meridian === "PM" && hour < 12) {
      hour += 12
    } else if (meridian === "AM" && hour === 12) {
      hour = 0
    }

    return hour
  }

  const getSessionForTimeSlot = (day, hour) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate)
      const sessionHour = getSessionHour(session.sessionTime)

      const isSameDate = 
        sessionDate.getDate() === day.date.getDate() &&
        sessionDate.getMonth() === day.date.getMonth() &&
        sessionDate.getFullYear() === day.date.getFullYear()

      // Handle different time formats
      let sessionTimeHour = sessionHour
      if (sessionTimeHour === null) {
        // Try to parse time in 24-hour format (e.g., "22:02")
        const timeMatch = session.sessionTime.match(/^(\d{1,2}):/)
        if (timeMatch) {
          sessionTimeHour = parseInt(timeMatch[1], 10)
        }
      }

      return isSameDate && sessionTimeHour === hour
    })
  }

  const formatSessionTime = (sessionTime) => {
    const timeMatch = sessionTime.match(/(\d+)([AP]M)/)
    if (!timeMatch) return sessionTime

    const hour = timeMatch[1]
    const meridian = timeMatch[2]

    return `${hour}:00 ${meridian}`
  }

  const calculateEndTime = (startTime, durationMinutes) => {
    const timeMatch = startTime.match(/(\d+)([AP]M)/)
    if (!timeMatch) return null

    let hour = parseInt(timeMatch[1], 10)
    const meridian = timeMatch[2]

    if (meridian === "PM" && hour < 12) {
      hour += 12
    } else if (meridian === "AM" && hour === 12) {
      hour = 0
    }

    const endDate = new Date()
    endDate.setHours(hour, 0, 0, 0)
    endDate.setMinutes(endDate.getMinutes() + durationMinutes)

    let endHour = endDate.getHours()
    const endMeridian = endHour >= 12 ? "PM" : "AM"

    if (endHour > 12) {
      endHour -= 12
    } else if (endHour === 0) {
      endHour = 12
    }

    return `${endHour}:00 ${endMeridian}`
  }

  const getSessionBackgroundColor = (session) => {
    if (!session) return "hover:bg-[#1a1e2a]"
    switch (session.status) {
      case "scheduled":
        return "bg-blue-400"
      case "completed":
        return "bg-green-400"
      case "cancelled":
        return "bg-[#3e2a2a]"
      default:
        return "bg-[#223039]"
    }
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
        body: JSON.stringify({
          ...formData,
          sessionDate: new Date(formData.sessionDate).toISOString()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add session')
      }
      
      const newSession = await response.json()
      
      // Update the sessions list with the new session
      setSessions(prevSessions => [...prevSessions, newSession])
      
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

      // Update calendar week if needed
      const newSessionDate = new Date(formData.sessionDate)
      const currentWeekStartDate = new Date(currentWeekStart)
      const newSessionWeekStart = getWeekStartDate(newSessionDate)
      
      if (newSessionWeekStart.getTime() !== currentWeekStartDate.getTime()) {
        setCurrentWeekStart(newSessionWeekStart)
      }
    } catch (err) {
      console.error('Error adding session:', err)
      setError(err.message)
    }
  }

  return (
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Sessions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">Scheduled Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{scheduledCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">Completed Sessions</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">Today's Sessions</CardTitle>
                <CalendarDays className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todaySessions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-0 mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Weekly Calendar</CardTitle>
                  <CardDescription className="text-white mt-3">View and manage sessions in calendar format</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 rounded-full hover:bg-gray-800 text-gray-300"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-[#2a3142] text-[#B4E90E] rounded-md hover:bg-[#353e52]"
                  >
                    Current Week
                  </button>
                  <button
                    onClick={goToNextWeek}
                    className="p-2 rounded-full hover:bg-gray-800 text-gray-300"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-max">
                    <div className="grid grid-cols-8 border-b border-gray-700">
                      <div className="p-2 text-center text-sm font-medium text-gray-500 border-r border-gray-700 sticky left-0 z-10">
                        GMT+00
                      </div>
                      {weekDays.map((day) => {
                        const isToday = day.date.toDateString() === new Date().toDateString()
                        return (
                          <div
                            key={day.dateStr}
                            className={`p-3 text-center border-r border-gray-700 ${isToday ? "bg-blue-900" : ""}`}
                          >
                            <div className="text-sm font-medium text-gray-400">
                              {day.name.toUpperCase()}
                            </div>
                            <div className={`text-2xl font-bold ${isToday ? "text-blue-300" : "text-white"}`}>
                              {day.date.getDate()}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-8 border-b border-gray-700">
                        <div className="p-2 text-right text-sm text-gray-500 border-r border-gray-700 sticky left-0 z-10">
                          {formatHour(hour)}
                        </div>
                        {weekDays.map((day) => {
                          const sessionsInSlot = getSessionForTimeSlot(day, hour)
                          return (
                            <div
                              key={`${day.dateStr}-${hour}`}
                              className="border-r border-gray-700 h-[50px] relative overflow-hidden"
                            >
                              <div className="absolute inset-0 flex flex-wrap gap-1 p-1 overflow-hidden">
                                {sessionsInSlot.length > 2 ? (
                                  // Show circles when there are more than 2 sessions
                                  <div className="w-full h-full flex flex-wrap items-center gap-1 p-1">
                                    {sessionsInSlot.map((session) => (
                                      <div
                                        key={session._id}
                                        className={`w-3 h-3 rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-white ${
                                          session.status === "scheduled" ? "bg-blue-400" :
                                          session.status === "completed" ? "bg-green-400" :
                                          session.status === "cancelled" ? "bg-[#3e2a2a]" :
                                          "bg-[#223039]"
                                        }`}
                                        onClick={() => {
                                          setSelectedCalendarSession(session)
                                          setShowSessionInfo(true)
                                        }}
                                        onMouseEnter={() => !isMobile && setHoveredSession(session)}
                                        onMouseLeave={() => !isMobile && setHoveredSession(null)}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  // Show full session info for 1-2 sessions
                                  <div className="w-full h-full flex gap-1">
                                    {sessionsInSlot.map((session) => (
                                      <div
                                        key={session._id}
                                        className={`flex-1 h-full rounded overflow-hidden cursor-pointer transition-all hover:bg-[#35505d] ${getSessionBackgroundColor(session)}`}
                                        onMouseEnter={() => !isMobile && setHoveredSession(session)}
                                        onMouseLeave={() => !isMobile && setHoveredSession(null)}
                                        onClick={() => {
                                          setSelectedCalendarSession(session)
                                          setShowSessionInfo(true)
                                        }}
                                      >
                                        <div className="h-full flex flex-col justify-start p-1">
                                          <div className="flex items-center gap-1 min-w-0">
                                            <User size={10} className="text-[#B4E90E] flex-shrink-0" />
                                            <span className="font-bold truncate text-xs">
                                              {getClientName(session.client)}
                                            </span>
                                          </div>
                                          <div className="text-gray-300 flex items-center gap-1 min-w-0">
                                            <MapPin size={8} className="flex-shrink-0" />
                                            <span className="truncate text-xs">{session.location}</span>
                                          </div>
                                          <div className="text-[#B4E90E] text-xs truncate min-w-0">
                                            {formatSessionTime(session.sessionTime)}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white mt-6">All Sessions</CardTitle>
                  <CardDescription className="text-white mt-3">Manage sessions, schedules, and appointments</CardDescription>
                </div>
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
                    className="bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer"
                    onClick={() => setShowAddForm(true)}
                  >
                    Add New
                  </Button>
                </div>
              </div>
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
  <thead className="sticky top-0 bg-gray-900 z-10">
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

      {/* Session Info Dialog */}
      <Dialog open={showSessionInfo} onOpenChange={setShowSessionInfo}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription className="text-white/60">
              View detailed information about the session
            </DialogDescription>
          </DialogHeader>
          {selectedCalendarSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-[#B4E90E]" />
                  <h3 className="font-bold text-lg">
                    {getClientName(selectedCalendarSession.client)}
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  selectedCalendarSession.status === "scheduled" ? "bg-blue-900 text-blue-300" :
                  selectedCalendarSession.status === "completed" ? "bg-green-900 text-green-300" :
                  selectedCalendarSession.status === "cancelled" ? "bg-red-900 text-red-300" :
                  "bg-gray-800 text-gray-300"
                }`}>
                  {selectedCalendarSession.status.charAt(0).toUpperCase() + selectedCalendarSession.status.slice(1)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Coach</p>
                    <p className="text-sm">{getCoachName(selectedCalendarSession.coach)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Session Time</p>
                    <p className="text-sm">
                      {new Date(selectedCalendarSession.sessionDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      , {formatSessionTime(selectedCalendarSession.sessionTime)} -{" "}
                      {calculateEndTime(
                        selectedCalendarSession.sessionTime,
                        selectedCalendarSession.duration
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm">{selectedCalendarSession.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Package size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Package</p>
                    <p className="text-sm">{getPackName(selectedCalendarSession.pack)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Client Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Age</p>
                      <p className="text-sm">{selectedCalendarSession.client?.age || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Weight</p>
                      <p className="text-sm">{selectedCalendarSession.client?.weight || "N/A"} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Height</p>
                      <p className="text-sm">{selectedCalendarSession.client?.height || "N/A"} cm</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Language</p>
                      <p className="text-sm">{selectedCalendarSession.client?.preferredLanguage || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {selectedCalendarSession.client?.diseases?.length > 0 && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Health Notes</p>
                    <p className="text-sm italic text-gray-300">
                      {selectedCalendarSession.client.diseases.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the session details
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleUpdateSession} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-client">Client</Label>
                    <Select 
                      value={formData.client} 
                      onValueChange={(value) => setFormData({...formData, client: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
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
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select coach" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
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
                    <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                      <SelectValue placeholder="Select pack" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      {packs.map((pack) => (
                        <SelectItem key={pack._id} value={pack._id}>
                          {pack.name || pack.category?.[locale]}
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
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                    className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </form>
            <DialogFooter className="mt-4 border-t border-white/10 pt-4">
              <Button 
                onClick={handleUpdateSession}
                className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
              >
                Update Session
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <DialogFooter className="mt-4 border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                className="hover:bg-gray-800 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSession}
                className="bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete Session
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Schedule a new training session
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleAddSession} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select 
                      value={formData.client} 
                      onValueChange={(value) => setFormData({...formData, client: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
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
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select coach" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
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
                    <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                      <SelectValue placeholder="Select pack" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      {packs.map((pack) => (
                        <SelectItem key={pack._id} value={pack._id}>
                          {pack.name || pack.category?.[locale]}
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
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                    className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </form>
            <DialogFooter className="mt-4 border-t border-white/10 pt-4">
              <Button 
                onClick={handleAddSession}
                className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
              >
                Add Session
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getWeekStartDate(date) {
  const day = date.getDay()
  const diff = day === 0 ? date.getDate() - 6 : date.getDate() - day + 1
  return new Date(date.setDate(diff))
}

function getWeekDays(startDate) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return {
      name: dayNames[i],
      date: new Date(date),
      dateStr: formatDateKey(date),
    }
  })
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function formatHour(hour) {
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`
}