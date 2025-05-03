"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, Calendar, CalendarDays, User, Search, Clock, MapPin, ChevronRight, ChevronLeft, Info, Mail, Package, X } from "lucide-react"
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
  useDeleteSessionMutation,
  useCancelSessionMutation,
  useCompleteSessionMutation
} from "@/redux/services/session.service"
import { useGetUserQuery } from "@/redux/services/user.service"
import { useGetPacksQuery } from "@/redux/services/pack.service"
import { toast } from "sonner"
import { useGetClientPackByClientIdQuery } from '@/redux/services/clientpack.service'

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
    clientPack: "",
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: "09:00",
    location: "",
    duration: 60,
    status: "scheduled"
  })
  const [selectedClientId, setSelectedClientId] = useState("")
  const [filteredClientPacks, setFilteredClientPacks] = useState([])
  const [filteredPacks, setFilteredPacks] = useState([])

  // RTK Query hooks
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useGetSessionsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetUserQuery();
  const { data: packsData, isLoading: packsLoading } = useGetPacksQuery();
  const [createSession] = useCreateSessionMutation();
  const [updateSession] = useUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [cancelSession] = useCancelSessionMutation();
  const [completeSession] = useCompleteSessionMutation();

  // Fetch client packs for the selected client
  const { data: clientPackData, isLoading: clientPackLoading } = useGetClientPackByClientIdQuery(selectedClientId, { skip: !selectedClientId });

  useEffect(() => {
    if (usersData?.success) {
      const users = usersData.users || [];
      setClients(users.filter(u => u.role === 'client'));
      setCoaches(users.filter(u => u.role === 'coach'));
    }
  }, [usersData]);

  useEffect(() => {
    if (sessionsData?.success) {
      setSessions(sessionsData.sessions || []);
    }
  }, [sessionsData]);

  useEffect(() => {
    if (packsData?.success) {
      setPacks(packsData.packs || []);
    }
  }, [packsData]);

  useEffect(() => {
    if (sessionsError) {
      setError(sessionsError.message || 'Failed to load sessions');
    }
  }, [sessionsError]);

  useEffect(() => {
    setIsLoading(sessionsLoading || usersLoading || packsLoading);
  }, [sessionsLoading, usersLoading, packsLoading]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // When client changes, update filtered packs and client packs
  useEffect(() => {
    if (formData.client && (typeof formData.client === 'string' || formData.client._id)) {
      const clientId = typeof formData.client === 'string' ? formData.client : formData.client._id;
      setSelectedClientId(clientId);
    } else {
      setSelectedClientId("");
      setFilteredClientPacks([]);
      setFilteredPacks([]);
    }
  }, [formData.client]);

  useEffect(() => {
    if (clientPackData && clientPackData.clientPack) {
      setFilteredClientPacks(clientPackData.clientPack);
      setFilteredPacks(clientPackData.clientPack.map(cp => cp.pack));
      // Auto-select the first available client pack if any
      if (clientPackData.clientPack.length > 0) {
        setFormData(prev => ({
          ...prev,
          clientPack: clientPackData.clientPack[0]._id,
          pack: clientPackData.clientPack[0].pack?._id || ''
        }));
      } else {
        setFormData(prev => ({ ...prev, pack: '', clientPack: '' }));
      }
    } else {
      setFilteredClientPacks([]);
      setFilteredPacks([]);
      setFormData(prev => ({ ...prev, pack: '', clientPack: '' }));
    }
  }, [clientPackData, selectedClientId]);

  // Show toast for data fetching errors
  useEffect(() => {
    if (sessionsError) toast.error(sessionsError.message || 'Failed to load sessions');
    if (usersLoading === false && usersData && usersData.success === false) toast.error('Failed to load users');
    if (packsLoading === false && packsData && packsData.success === false) toast.error('Failed to load packs');
    if (clientPackLoading === false && clientPackData && clientPackData.success === false) toast.error('Failed to load client packs');
  }, [sessionsError, usersLoading, usersData, packsLoading, packsData, clientPackLoading, clientPackData]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500 hover:bg-blue-600";
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "scheduled":
        return "text-blue-300";
      case "completed":
        return "text-green-300";
      case "pending":
        return "text-yellow-300";
      case "cancelled":
        return "text-red-300";
      default:
        return "text-gray-300";
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-900";
      case "completed":
        return "bg-green-900";
      case "pending":
        return "bg-yellow-900";
      case "cancelled":
        return "bg-red-900";
      default:
        return "bg-gray-900";
    }
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      if (!selectedSession) {
        toast.error('No session selected for update');
        return;
      }
      // Find the selected clientPack object
      const selectedClientPackObj = filteredClientPacks.find(cp => (cp._id === (formData.clientPack?._id || formData.clientPack)));
      const packId = selectedClientPackObj?.pack?._id || selectedClientPackObj?.pack;

      const updateData = {
        client: typeof formData.client === 'object' ? formData.client._id : formData.client,
        coach: typeof formData.coach === 'object' ? formData.coach._id : formData.coach,
        pack: packId,
        clientPack: typeof formData.clientPack === 'object' ? formData.clientPack._id : formData.clientPack,
        sessionDate: formData.sessionDate,
        sessionTime: formData.sessionTime,
        location: formData.location,
        duration: 60, // Default duration
        status: formData.status
      };

      const result = await updateSession({
        id: selectedSession._id,
        ...updateData
      }).unwrap();
      
      if (result.success) {
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session._id === selectedSession._id 
              ? { ...session, ...updateData }
              : session
          )
        );
        if (selectedCalendarSession?._id === selectedSession._id) {
          setSelectedCalendarSession(prev => ({
            ...prev,
            ...updateData
          }));
        }
        setShowEditForm(false);
        setSelectedSession(null);
        setFormData({
          client: "",
          coach: "",
          clientPack: "",
          sessionDate: "",
          sessionTime: "",
          location: "",
          duration: 60, // Default duration
          status: "scheduled"
        });
        toast.success('Session updated successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating session');
    }
  };

  const handleDeleteSession = async () => {
    try {
      if (!selectedSession?._id) {
        toast.error('No session selected for deletion');
        throw new Error('No session selected for deletion');
      }
      const result = await deleteSession(selectedSession._id).unwrap();
      if (result.success) {
        setSessions(prevSessions => prevSessions.filter(session => session._id !== selectedSession._id));
      if (selectedCalendarSession?._id === selectedSession._id) {
          setSelectedCalendarSession(null);
          setShowSessionInfo(false);
        }
        setShowDeleteDialog(false);
        setSelectedSession(null);
        toast.success('Session deleted successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting session');
    }
  };

  const getSessionBackgroundColor = (session) => {
    if (!session) return "hover:bg-[#1a1e2a]";
    return getStatusColor(session.status);
  };

  const renderStatusBadge = (status) => {
    return (
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBackgroundColor(status)} ${getStatusTextColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const renderStatusCell = (status) => {
    return (
      <div className={`p-4 text-sm ${getStatusTextColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (err) {
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
  const scheduledCount = sessions.filter(session => session.status === 'scheduled').length;
  const completedCount = sessions.filter(session => session.status === 'completed').length;
  const canceledCount = sessions.filter(session => session.status === 'cancelled').length;

  // Get today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate).toISOString().split('T')[0];
    return sessionDate === today;
  });

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

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      // Collect missing fields
      const missingFields = [];
      if (!formData.client) missingFields.push('client');
      if (!formData.coach) missingFields.push('coach');
      if (!formData.clientPack) missingFields.push('clientPack');
      if (!formData.sessionDate) missingFields.push('date');
      if (!formData.sessionTime) missingFields.push('time');
      if (!formData.location) missingFields.push('location');
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }

      // Close the dialog immediately
      setShowAddForm(false);

      // Find the selected clientPack object
      const selectedClientPackObj = filteredClientPacks.find(cp => (cp._id === (formData.clientPack?._id || formData.clientPack)));
      const packId = selectedClientPackObj?.pack?._id || selectedClientPackObj?.pack;

      const newSession = {
        client: typeof formData.client === 'object' ? formData.client._id : formData.client,
        coach: typeof formData.coach === 'object' ? formData.coach._id : formData.coach,
        pack: packId,
        clientPack: typeof formData.clientPack === 'object' ? formData.clientPack._id : formData.clientPack,
        sessionDate: formData.sessionDate,
        sessionTime: formData.sessionTime,
        location: formData.location,
        duration: 60, // Default duration
        status: formData.status || "scheduled"
      };

      const result = await createSession(newSession).unwrap();
      if (result.success) {
        setSessions(prevSessions => [...prevSessions, result.session]);
        setFormData({
          client: "",
          coach: "",
          clientPack: "",
          sessionDate: "",
          sessionTime: "",
          location: "",
          duration: 60, // Default duration
          status: "scheduled"
        });
        toast.success('Session added successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Error creating session');
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      const result = await cancelSession(sessionId).unwrap();
      if (result.success) {
        toast.success('Session cancelled successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Error canceling session');
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      const result = await completeSession(sessionId).unwrap();
      if (result.success) {
        toast.success('Session completed successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Error completing session');
    }
  };

  const renderClientSelect = () => {
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

  const renderClientPackSelect = () => {
    return (
      <Select 
        value={typeof formData.clientPack === 'object' ? formData.clientPack._id : formData.clientPack}
        onValueChange={(value) => setFormData({...formData, clientPack: value})}
        required
        disabled={filteredClientPacks.length === 0}
      >
        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
          <SelectValue placeholder="Select client pack" />
        </SelectTrigger>
        <SelectContent className="border-white/10">
          {filteredClientPacks.map((clientPack) => (
            <SelectItem key={clientPack._id} value={clientPack._id}>
              {clientPack.pack?.category?.[locale] || clientPack.pack?.name}
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

  const renderDurationInput = () => {
    return (
      <Input
        type="number"
        value={60}
        disabled
        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
      />
    );
  };

  const renderStatusSelect = () => {
    return (
      <Select 
        value={formData.status} 
        onValueChange={(value) => setFormData({...formData, status: value})}
        required
      >
        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="border-white/10">
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  function toTimeInputValue(timeStr) {
    if (!timeStr) return '09:00';
    // If already in HH:mm, return as is
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // If in H:mm, pad hour
    if (/^\d{1}:\d{2}$/.test(timeStr)) return '0' + timeStr;
    // If in 12-hour format with optional minutes and AM/PM
    const match = timeStr.match(/^(\d{1,2}):?(\d{2})? ?([AP]M)$/i);
    if (match) {
      let [_, h, m, ampm] = match;
      h = parseInt(h, 10);
      m = m || '00';
      if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      return (h < 10 ? '0' : '') + h + ':' + m;
    }
    // If just H or HH with AM/PM (e.g., 10AM, 2PM)
    const matchSimple = timeStr.match(/^(\d{1,2}) ?([AP]M)$/i);
    if (matchSimple) {
      let [_, h, ampm] = matchSimple;
      h = parseInt(h, 10);
      if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      return (h < 10 ? '0' : '') + h + ':00';
    }
    // fallback
    return '09:00';
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6">Sessions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6 w-full min-w-0">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Scheduled Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{scheduledCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Completed Sessions</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Cancelled Sessions</CardTitle>
                <X className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{canceledCount}</div>
              </CardContent>
            </Card>
          </div>
          <div className="border-t border-white/10 my-6"></div>

          <Card className="bg-gray-900 border-0 w-full min-w-0">
            <CardHeader>
              <CardTitle className="text-white mt-3">Weekly Calendar</CardTitle>
              <CardDescription className="text-white/60">View and manage sessions in calendar format</CardDescription>
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

          <Card className="bg-gray-900 border-0 mt-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white mt-3">All Sessions</CardTitle>
                  <CardDescription className="text-white/60">Manage sessions, schedules, and appointments</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-end justify-end gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input 
                      type="search" 
                      placeholder="Search sessions..." 
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
                <div className="block w-full overflow-x-auto rounded-md">
                  <table className="w-full min-w-full md:min-w-[700px] border-collapse text-xs sm:text-sm md:text-base">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="border-b border-white/10">
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Client</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Coach</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Pack</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Date</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Time</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Location</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Status</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-4 text-center text-white border-b border-white/10">
                            No sessions found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((session) => (
                          <tr key={session._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium text-white border-r border-white/10">
                              {getClientName(session.client)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {getCoachName(session.coach)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {getPackName(session.pack)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {formatDate(session.sessionDate)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {session.sessionTime}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {session.location}
                            </td>
                            <td className={`px-2 py-2 sm:px-4 sm:py-3 text-sm border-r border-white/10 ${getStatusTextColor(session.status)}`}>
                              {renderStatusCell(session.status)}
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
                                      setSelectedSession(session);
                                      setFormData({
                                        client: session.client?._id || session.client,
                                        coach: session.coach?._id || session.coach,
                                        clientPack: session.clientPack?._id || session.clientPack,
                                        sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                        sessionTime: session.sessionTime || '09:00',
                                        location: session.location || '',
                                        duration: session.duration || 60,
                                        status: session.status || 'scheduled'
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
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
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
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBackgroundColor(selectedCalendarSession.status)} ${getStatusTextColor(selectedCalendarSession.status)}`}>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
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
                    <Select value={formData.client?._id || formData.client} disabled>
                      <SelectTrigger className="bg-gray-800 border-white/10">
                        <SelectValue>
                          {formData.client?.firstName ? `${formData.client.firstName} ${formData.client.lastName}` : getClientName(formData.client)}
                        </SelectValue>
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-coach">Coach</Label>
                    {renderCoachSelect()}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-clientPack">Client Pack</Label>
                  {renderClientPackSelect()}
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
                    {renderDurationInput()}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    {renderStatusSelect()}
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
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this session? This action cannot be undone.
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
              onClick={handleDeleteSession}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
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
                  <Label htmlFor="clientPack">Client Pack</Label>
                  {renderClientPackSelect()}
                  {filteredClientPacks.length === 0 && (
                    <div className="text-red-400 text-xs mt-1">This client has no active packs. Please assign a pack first.</div>
                  )}
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
                    {renderDurationInput()}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    {renderStatusSelect()}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 border-t border-white/10 pt-4">
                <Button 
                  type="submit"
                  className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
                  disabled={filteredClientPacks.length === 0}
                >
                  Add Session
                </Button>
              </DialogFooter>
            </form>
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