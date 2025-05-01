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
import { 
  useGetSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation
} from "@/redux/services/session.service"
import { useGetUserQuery } from "@/redux/services/user.service"
import { useGetPacksQuery } from "@/redux/services/pack.service"

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

  // Check if backend URL is configured
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.error('NEXT_PUBLIC_BACKEND_URL is not configured');
      setError('Backend URL is not configured. Please check your environment variables.');
      return;
    }
  }, []);

  // RTK Query hooks
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useGetSessionsQuery(undefined, {
    skip: !process.env.NEXT_PUBLIC_BACKEND_URL
  });
  const { data: usersData, isLoading: usersLoading } = useGetUserQuery(undefined, {
    skip: !process.env.NEXT_PUBLIC_BACKEND_URL
  });
  const { data: packsData, isLoading: packsLoading } = useGetPacksQuery(undefined, {
    skip: !process.env.NEXT_PUBLIC_BACKEND_URL
  });
  const [createSession] = useCreateSessionMutation()
  const [updateSession] = useUpdateSessionMutation()
  const [deleteSession] = useDeleteSessionMutation()

  // Debug logs
  useEffect(() => {
    console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('Sessions Data:', sessionsData);
    console.log('Users Data:', usersData);
    console.log('Packs Data:', packsData);
    console.log('Loading States:', {
      sessions: sessionsLoading,
      users: usersLoading,
      packs: packsLoading
    });
    console.log('Errors:', {
      sessions: sessionsError,
    });
  }, [sessionsData, usersData, packsData, sessionsLoading, usersLoading, packsLoading, sessionsError]);

  useEffect(() => {
    // Always extract from sessions as a fallback
    const sessionClients = sessions
      .map(s => s.client)
      .filter(Boolean)
      .filter((c, i, arr) => c && c._id && arr.findIndex(x => x._id === c._id) === i);

    const sessionCoaches = sessions
      .map(s => s.coach)
      .filter(Boolean)
      .filter((c, i, arr) => c && c._id && arr.findIndex(x => x._id === c._id) === i);

    if (usersData && usersData.users && Array.isArray(usersData.users)) {
      const usersArray = usersData.users;
      setClients(usersArray.filter(u => u.role === 'client'));
      setCoaches(usersArray.filter(u => u.role === 'coach'));
    } else {
      // Fallback: use clients/coaches from sessions
      setClients(sessionClients);
      setCoaches(sessionCoaches);
    }
  }, [usersData, sessions]);

  // Add a separate effect to handle session data
  useEffect(() => {
    if (sessionsData) {
      console.log('Setting sessions:', sessionsData);
      // Handle the API response structure
      const sessionsArray = sessionsData.success ? sessionsData.sessions : [];
      console.log('Processed sessions array:', sessionsArray);
      setSessions(Array.isArray(sessionsArray) ? sessionsArray : []);
    }
  }, [sessionsData])

  useEffect(() => {
    if (packsData) {
      console.log('Setting packs:', packsData);
      // Handle the API response structure
      const packsArray = packsData.success ? packsData.packs : [];
      setPacks(Array.isArray(packsArray) ? packsArray : [])
    }
  }, [packsData])

  useEffect(() => {
    if (sessionsError) {
      console.error('Sessions Error:', sessionsError);
      setError(sessionsError.message || 'Failed to load sessions')
    }
  }, [sessionsError])

  // Update loading state based on all queries
  useEffect(() => {
    setIsLoading(sessionsLoading || usersLoading || packsLoading);
  }, [sessionsLoading, usersLoading, packsLoading]);

  // Separate useEffect for handling automatic pending status
  useEffect(() => {
    if (!sessions.length) return;

    const updatePendingSessions = async () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

      sessions.forEach(async (session) => {
        if (session.sessionStatus === 'upcoming' && session.status === 'scheduled') {
          const sessionDate = new Date(session.sessionDate);
          const [hours, minutes] = session.sessionTime.split(':').map(Number);
          const sessionTimeInMinutes = hours * 60 + minutes;
          
          // Check if session is today and time has arrived
          if (sessionDate.toDateString() === now.toDateString() && 
              sessionTimeInMinutes <= currentTime) {
            try {
              await updateSession({
                id: session._id,
                sessionStatus: 'pending',
                status: 'scheduled'
              });
            } catch (error) {
              console.error('Error updating session status:', error);
            }
          }
        }
      });
    };

    // Initial check
    updatePendingSessions();

    // Set up interval to check every minute
    const intervalId = setInterval(updatePendingSessions, 60000);

    return () => clearInterval(intervalId);
  }, [sessions, selectedCalendarSession, updateSession]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Improved helper functions for name lookups with better error handling and debugging
  const getClientName = (clientId) => {
    if (!clientId) return 'No Client';
    if (typeof clientId === 'object' && clientId.firstName && clientId.lastName) {
      return `${clientId.firstName} ${clientId.lastName}`;
    }
    const client = clients.find(c => c._id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  }

  const getCoachName = (coachId) => {
    if (!coachId) return 'No Coach';
    if (typeof coachId === 'object' && coachId.firstName && coachId.lastName) {
      return `${coachId.firstName} ${coachId.lastName}`;
    }
    const coach = coaches.find(c => c._id === coachId);
    return coach ? `${coach.firstName} ${coach.lastName}` : 'Unknown Coach';
  }

  const getPackName = (packId) => {
    if (!packId) return 'No Pack';
    if (typeof packId === 'object') {
      // If pack is an object, try to get the localized name
      if (packId.category && packId.category[locale]) {
        return packId.category[locale];
      }
      // Fallback to name if category is not available
      return packId.name || 'Unknown Pack';
    }
    const pack = packs.find(p => p._id === packId);
    if (pack) {
      if (pack.category && pack.category[locale]) {
        return pack.category[locale];
      }
      return pack.name || 'Unknown Pack';
    }
    return 'Unknown Pack';
  }

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      if (!selectedSession) {
        console.error('No session selected for update');
        return;
      }

      // Prepare the update data (only send status, let backend sync sessionStatus)
      const updateData = {
        client: typeof formData.client === 'object' ? formData.client._id : formData.client,
        coach: typeof formData.coach === 'object' ? formData.coach._id : formData.coach,
        pack: typeof formData.pack === 'object' ? formData.pack._id : formData.pack,
        sessionDate: formData.sessionDate,
        sessionTime: formData.sessionTime,
        location: formData.location,
        duration: formData.duration,
        status: formData.status
      };

      // Call the update mutation
      const result = await updateSession({
        id: selectedSession._id,
        ...updateData
      }).unwrap();
      
      if (result.success && result.session) {
        // Update the sessions array with the new data from backend
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session._id === selectedSession._id 
              ? result.session 
              : session
          )
        );

        // Update the selected calendar session if it's the same session
        if (selectedCalendarSession?._id === selectedSession._id) {
          setSelectedCalendarSession(result.session);
        }

        // Force a calendar refresh by updating the current week start
        setCurrentWeekStart(new Date(currentWeekStart));

        setShowEditForm(false);
        setSelectedSession(null);
        // Reset form data
        setFormData({
          client: "",
          coach: "",
          pack: "",
          sessionDate: new Date().toISOString().split('T')[0],
          sessionTime: "09:00",
          location: "",
          duration: 60,
          status: "scheduled"
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
      setError(error.message);
    }
  };

  const handleDeleteSession = async () => {
    try {
      if (!selectedSession?._id) {
        throw new Error('No session selected for deletion')
      }

      await deleteSession(selectedSession._id);
      
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
      case "canceled":
        return "text-red-500";
      case "completed":
        return "text-green-500";
      case "scheduled":
        return "text-blue-500";
      default:
        return "text-white";
    }
  };

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

  const getSessionForTimeSlot = (day, hour) => {
    if (!sessions || !Array.isArray(sessions)) return [];
    
    return sessions.filter((session) => {
      try {
        if (!session || !session.sessionDate || !session.sessionTime) return false;
        
        const sessionDate = new Date(session.sessionDate);
        if (isNaN(sessionDate.getTime())) return false;

        // Parse the session time
        let sessionHour;
        if (session.sessionTime.includes(':')) {
          // Handle 24-hour format (e.g., "14:30")
          const [hours, minutes] = session.sessionTime.split(':').map(Number);
          sessionHour = hours;
        } else {
          // Handle 12-hour format (e.g., "2:30 PM")
          const timeMatch = session.sessionTime.match(/(\d+)([AP]M)/);
          if (!timeMatch) return false;
          
          let hour = parseInt(timeMatch[1], 10);
          const meridian = timeMatch[2];
          
          if (meridian === "PM" && hour < 12) {
            hour += 12;
          } else if (meridian === "AM" && hour === 12) {
            hour = 0;
          }
          sessionHour = hour;
        }

        const isSameDate = 
          sessionDate.getDate() === day.date.getDate() &&
          sessionDate.getMonth() === day.date.getMonth() &&
          sessionDate.getFullYear() === day.date.getFullYear();

        return isSameDate && sessionHour === hour;
      } catch (error) {
        console.error('Error processing session:', error);
        return false;
      }
    });
  };

  const formatSessionTime = (sessionTime) => {
    if (!sessionTime) return '';
    
    if (sessionTime.includes(':')) {
      // Handle 24-hour format
      const [hours, minutes] = sessionTime.split(':');
      const hour = parseInt(hours, 10);
      const meridian = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${meridian}`;
    } else {
      // Handle 12-hour format
      return sessionTime;
    }
  };

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
    if (!session) return "hover:bg-[#1a1e2a]";
    
    switch (session.status) {
      case "canceled":
        return "bg-[#3e2a2a]";
      case "completed":
        return "bg-green-400";
      case "scheduled":
        return "bg-blue-400";
      default:
        return "bg-[#223039]";
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      // Validate all required fields
      if (!formData.client) {
        throw new Error('Please select a client');
      }
      if (!formData.coach) {
        throw new Error('Please select a coach');
      }
      if (!formData.pack) {
        throw new Error('Please select a pack');
      }
      if (!formData.sessionDate) {
        throw new Error('Please select a date');
      }
      if (!formData.sessionTime) {
        throw new Error('Please select a time');
      }
      if (!formData.location) {
        throw new Error('Please enter a location');
      }

      // Extract IDs from objects if they are objects
      const newSession = {
        ...formData,
        client: typeof formData.client === 'object' ? formData.client._id : formData.client,
        coach: typeof formData.coach === 'object' ? formData.coach._id : formData.coach,
        pack: typeof formData.pack === 'object' ? formData.pack._id : formData.pack,
      };

      const result = await createSession(newSession).unwrap();
      if (result.success) {
        setShowAddForm(false);
        setFormData({
          client: "",
          coach: "",
          pack: "",
          sessionDate: new Date().toISOString().split('T')[0],
          sessionTime: "09:00",
          location: "",
          duration: 60,
          status: "scheduled"
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error.message || 'Failed to create session');
    }
  };

  const renderClientSelect = () => {
    console.log('Rendering client select with clients:', clients);
    return (
      <Select 
        value={formData.client?._id || formData.client} 
        onValueChange={(value) => {
          const selectedClient = clients.find(c => c._id === value);
          setFormData({...formData, client: selectedClient || value});
        }}
        required
      >
        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
          <SelectValue placeholder="Select client">
            {formData.client?.firstName ? `${formData.client.firstName} ${formData.client.lastName}` : "Select client"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="border-white/10">
          {clients.map((client) => (
            <SelectItem key={client._id} value={client._id}>
              {client.firstName} {client.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderCoachSelect = () => {
    console.log('Rendering coach select with coaches:', coaches);
    return (
      <Select 
        value={formData.coach?._id || formData.coach} 
        onValueChange={(value) => {
          const selectedCoach = coaches.find(c => c._id === value);
          setFormData({...formData, coach: selectedCoach || value});
        }}
        required
      >
        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
          <SelectValue placeholder="Select coach">
            {formData.coach?.firstName ? `${formData.coach.firstName} ${formData.coach.lastName}` : "Select coach"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="border-white/10">
          {coaches.map((coach) => (
            <SelectItem key={coach._id} value={coach._id}>
              {coach.firstName} {coach.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderPackSelect = () => {
    console.log('Rendering pack select with packs:', packs);
    return (
      <Select 
        value={formData.pack?._id || formData.pack} 
        onValueChange={(value) => {
          const selectedPack = packs.find(p => p._id === value);
          setFormData({...formData, pack: selectedPack || value});
        }}
        required
      >
        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
          <SelectValue placeholder="Select pack">
            {formData.pack?.category?.[locale] || "Select pack"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="border-white/10">
          {packs.map((pack) => (
            <SelectItem key={pack._id} value={pack._id}>
              {pack.category?.[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderDateInput = () => {
    return (
      <Input
        type="date"
        value={formData.sessionDate}
        onChange={(e) => setFormData({...formData, sessionDate: e.target.value})}
        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
        required
      />
    );
  };

  const renderTimeInput = () => {
    return (
      <Input
        type="time"
        value={formData.sessionTime}
        onChange={(e) => setFormData({...formData, sessionTime: e.target.value})}
        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
        required
      />
    );
  };

  const renderLocationInput = () => {
    return (
      <Input
        type="text"
        value={formData.location}
        onChange={(e) => setFormData({...formData, location: e.target.value})}
        placeholder="Enter location"
        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
        required
      />
    );
  };

  // Add a useEffect to handle session updates
  useEffect(() => {
    if (sessionsData) {
      const sessionsArray = sessionsData.success ? sessionsData.sessions : [];
      setSessions(Array.isArray(sessionsArray) ? sessionsArray : []);
    }
  }, [sessionsData]);

  // Add a useEffect to handle calendar updates
  useEffect(() => {
    if (sessions.length > 0) {
      // Force calendar refresh when sessions change
      setCurrentWeekStart(new Date(currentWeekStart));
    }
  }, [sessions]);

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
                          const sessionsInSlot = getSessionForTimeSlot(day, hour);
                          return (
                            <div
                              key={`${day.dateStr}-${hour}`}
                              className="border-r border-gray-700 h-[50px] relative overflow-hidden"
                            >
                              <div className="absolute inset-0 flex flex-wrap gap-1 p-1 overflow-hidden">
                                {sessionsInSlot.map((session) => (
                                  <div
                                    key={session._id}
                                    className={`flex-1 h-full rounded overflow-hidden cursor-pointer transition-all hover:bg-[#35505d] ${getSessionBackgroundColor(session)}`}
                                    onClick={() => {
                                      setSelectedCalendarSession(session);
                                      setShowSessionInfo(true);
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
                            </div>
                          );
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
                    if (!session) return;
                    
                    setSelectedSession(session);
                    setFormData({
                      client: session.client?._id || session.client,
                      coach: session.coach?._id || session.coach,
                      pack: session.pack?._id || session.pack,
                      sessionDate: new Date(session.sessionDate).toISOString().split('T')[0],
                      sessionTime: session.sessionTime,
                      location: session.location,
                      duration: session.duration,
                      status: session.status
                    });
                    setShowEditForm(true);
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
                <div className="flex items-center gap-2">
                  {/* Only show the sessionStatus badge if it is a valid value */}
                  {['upcoming', 'pending', 'finished'].includes(selectedCalendarSession.sessionStatus) && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${selectedCalendarSession.sessionStatus === 'upcoming' ? 'bg-blue-900 text-blue-300' : ''}
                        ${selectedCalendarSession.sessionStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' : ''}
                        ${selectedCalendarSession.sessionStatus === 'finished' ? 'bg-green-900 text-green-300' : ''}
                      `}
                    >
                      {selectedCalendarSession.sessionStatus === 'upcoming' && 'Upcoming'}
                      {selectedCalendarSession.sessionStatus === 'pending' && 'Pending'}
                      {selectedCalendarSession.sessionStatus === 'finished' && 'Finished'}
                    </span>
                  )}
                  <Select 
                    value={selectedCalendarSession.sessionStatus || ''} 
                    onValueChange={async (value) => {
                      // Optimistically update the badge
                      setSelectedCalendarSession(prev => ({
                        ...prev,
                        sessionStatus: value
                      }));
                      try {
                        const newStatus = value === 'finished' ? 'completed' : 'scheduled';
                        const result = await updateSession({
                          id: selectedCalendarSession._id,
                          sessionStatus: value,
                          status: newStatus
                        }).unwrap();
                        // Update sessions and selectedCalendarSession with backend data
                        if (result && result.session) {
                          setSessions(prevSessions =>
                            prevSessions.map(session =>
                              session._id === result.session._id ? result.session : session
                            )
                          );
                          setSelectedCalendarSession(prev => ({
                            ...prev,
                            ...result.session,
                            // Fallback: if backend does not return sessionStatus, use the selected value
                            sessionStatus: result.session.sessionStatus || value
                          }));
                        } else {
                          // Fallback: ensure badge updates even if backend does not return session
                          setSelectedCalendarSession(prev => ({
                            ...prev,
                            sessionStatus: value
                          }));
                        }
                      } catch (error) {
                        console.error('Error updating session status:', error);
                      }
                    }}
                  >
                    <SelectTrigger className={`w-[140px] font-bold text-white ${
                      selectedCalendarSession.sessionStatus === "upcoming" ? "bg-blue-900" :
                      selectedCalendarSession.sessionStatus === "finished" ? "bg-green-900" :
                      selectedCalendarSession.sessionStatus === "pending" ? "bg-yellow-900 text-yellow-300" :
                      "bg-gray-800 text-gray-300"
                    }`}>
                      {/* Always show placeholder, not the value */}
                      <span className="text-white font-bold">Change status</span>
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedCalendarSession.status === 'canceled' && (
                    <div className="px-3 py-1 bg-red-900 text-red-300 rounded-full text-sm">
                      Canceled
                    </div>
                  )}
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
                    {renderClientSelect()}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-coach">Coach</Label>
                    {renderCoachSelect()}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-pack">Pack</Label>
                  {renderPackSelect()}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sessionDate">Date</Label>
                    {renderDateInput()}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sessionTime">Time</Label>
                    {renderTimeInput()}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  {renderLocationInput()}
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
              <DialogFooter className="mt-4 border-t border-white/10 pt-4">
                <Button 
                  type="submit"
                  className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
                >
                  Update Session
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
                    {renderClientSelect()}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="coach">Coach</Label>
                    {renderCoachSelect()}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pack">Pack</Label>
                  {renderPackSelect()}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sessionDate">Date</Label>
                    {renderDateInput()}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sessionTime">Time</Label>
                    {renderTimeInput()}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  {renderLocationInput()}
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