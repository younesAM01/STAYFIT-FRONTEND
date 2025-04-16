"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts"
import { Calendar, CheckCircle, Clock, FileText, Users, X, XCircle } from "lucide-react"
import { motion } from "framer-motion"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"


export default function CoachDashboard() {
  const { mongoUser } = useAuth();
  const coachId = mongoUser?._id;

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [coachSessions, setCoachSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(coachSessions)
  const fetchCoachSessions = async (coachId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/session?coachId=${coachId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      const data = await response.json();
      setCoachSessions(data);
    } catch (error) {
      console.error("Error fetching coach sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (coachId) {
      fetchCoachSessions(coachId);
    }
  }, [coachId]);

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  // Mock data
  const sessionStats = [
    {
      title: "Sessions Scheduled",
      value: "24",
      icon: Clock,
      description: "This week",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Sessions Completed",
      value: "18",
      icon: CheckCircle,
      description: "This week",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Sessions Cancelled",
      value: "3",
      icon: XCircle,
      description: "This week",
      change: "-2%",
      changeType: "negative",
    },
    {
      title: "Total Sessions",
      value: "142",
      icon: Calendar,
      description: "All time",
      change: "+24%",
      changeType: "positive",
    },
  ]

  // Mock data for charts
  const weeklySessionsData = [
    { name: "Mon", sessions: 5 },
    { name: "Tue", sessions: 8 },
    { name: "Wed", sessions: 6 },
    { name: "Thu", sessions: 9 },
    { name: "Fri", sessions: 7 },
    { name: "Sat", sessions: 3 },
    { name: "Sun", sessions: 2 },
  ]

  const clientSatisfactionData = [
    { name: "Week 1", satisfaction: 4.2 },
    { name: "Week 2", satisfaction: 4.5 },
    { name: "Week 3", satisfaction: 4.3 },
    { name: "Week 4", satisfaction: 4.7 },
    { name: "Week 5", satisfaction: 4.8 },
    { name: "Week 6", satisfaction: 4.6 },
  ]
  
  const sortCoachSessions = (sessions) => {
    if (!sessions || !Array.isArray(sessions)) {
      return { upcoming: [], completed: [], cancelled: [] };
    }
  
    // Current date for comparison
    const currentDate = new Date();
    
    // Initialize categories
    const sortedSessions = {
      upcoming: [],
      completed: [],
      cancelled: []
    };
  
    // Sort sessions into categories
    sessions.forEach(session => {
      // Convert session date string to Date object
      const sessionDate = new Date(session.sessionDate);
      
      // Categorize based on status
      if (session.status === "cancelled") {
        sortedSessions.cancelled.push({
          id: session._id,
          client: `${session.client.firstName || ''} ${session.client.lastName || ''}`.trim() || "Unknown Client",
          date: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: `${session.sessionTime}`,
          duration: `${session.duration || 60} min`,
          status: "cancelled"
        });
      } else if (session.status === "completed") {
        sortedSessions.completed.push({
          id: session._id,
          client: `${session.client.firstName || ''} ${session.client.lastName || ''}`.trim() || "Unknown Client",
          date: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: `${session.sessionTime}`,
          duration: `${session.duration || 60} min`,
          status: "completed"
        });
      } else {
        // Any other status (confirmed, pending, etc.) is considered upcoming if in the future
        const status = sessionDate > currentDate ? 
          (session.status === "confirmed" ? "confirmed" : "scheduled") : 
          (session.status || "scheduled");
          
        sortedSessions.upcoming.push({
          id: session._id,
          client: `${session.client.firstName || ''} ${session.client.lastName || ''}`.trim() || "Unknown Client",
          date: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: `${session.sessionTime}`,
          duration: `${session.duration || 60} min`,
          status: status
        });
      }
    });
  
    // Sort upcoming sessions by date (earliest first)
    sortedSessions.upcoming.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    // Sort completed and cancelled sessions by date (latest first)
    sortedSessions.completed.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    sortedSessions.cancelled.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  
    return sortedSessions;
  }

  const sortedSessions = sortCoachSessions(coachSessions);
  console.log(sortedSessions)

 

  const mainColor = "#B4E90E"
  const bgColor = "#0d111a"
  const textColor = "#FFFFFF"

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ color: textColor }}>
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold tracking-tight text-white">Coach Dashboard</h1>
            <p className="text-gray-400">Monitor your coaching sessions and client progress</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sessionStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className={`text-xs ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                    <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: mainColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number.parseInt(stat.value) / 200) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
            {/* Weekly Sessions Chart */}
            <Card className="shadow-md bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white p-2">Weekly Sessions</CardTitle>
                <CardDescription className="text-gray-400">Number of sessions per day this week</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySessionsData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                        color: '#F9FAFB'
                      }}
                    />
                    <Bar dataKey="sessions" fill={mainColor} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="sessions" position="top" fill="#D1D5DB" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Client Satisfaction Chart */}
            <Card className="shadow-md bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Client Satisfaction</CardTitle>
                <CardDescription className="text-gray-400">Average rating over the past 6 weeks</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientSatisfactionData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis domain={[3, 5]} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke={mainColor} 
                      strokeWidth={3}
                      dot={{ r: 6, fill: mainColor, strokeWidth: 2, stroke: '#1F2937' }}
                      activeDot={{ r: 8, fill: mainColor, strokeWidth: 2, stroke: '#1F2937' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity with Sessions Table */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Coaching Sessions</CardTitle>
                <CardDescription className="text-gray-400">Manage all your scheduled sessions</CardDescription>
                <div className="flex space-x-1 mt-2 border-b border-gray-800">
                  <button 
                    onClick={() => setActiveTab("upcoming")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "upcoming" ? 
                      `border-b-2 border-${mainColor} text-${mainColor}` : "text-gray-400 hover:text-gray-300"}`}
                    style={{ borderColor: activeTab === "upcoming" ? mainColor : "transparent", color: activeTab === "upcoming" ? mainColor : "" }}
                  >
                    Upcoming
                  </button>
                  <button 
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "completed" ? 
                      `border-b-2 border-${mainColor} text-${mainColor}` : "text-gray-400 hover:text-gray-300"}`}
                    style={{ borderColor: activeTab === "completed" ? mainColor : "transparent", color: activeTab === "completed" ? mainColor : "" }}
                  >
                    Completed
                  </button>
                  <button 
                    onClick={() => setActiveTab("cancelled")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "cancelled" ? 
                      `border-b-2 border-${mainColor} text-${mainColor}` : "text-gray-400 hover:text-gray-300"}`}
                    style={{ borderColor: activeTab === "cancelled" ? mainColor : "transparent", color: activeTab === "cancelled" ? mainColor : "" }}
                  >
                    Cancelled
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-800">
                  <Table>
                    <TableHeader className="bg-gray-800">
                      <TableRow className="hover:bg-gray-800/70 border-gray-700">
                        <TableHead className="text-gray-300">Client</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Time</TableHead>
                        <TableHead className="text-gray-300">Duration</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSessions[activeTab].map((session) => (
                        <TableRow key={session.id} className="hover:bg-gray-800/50 border-gray-800">
                          <TableCell className="font-medium text-white">{session.client}</TableCell>
                          <TableCell className="text-gray-300">{session.date}</TableCell>
                          <TableCell className="text-gray-300">{session.time}</TableCell>
                          <TableCell className="text-gray-300">{session.duration}</TableCell>
                          <TableCell>
                            <Badge 
                              className={`${
                                session.status === "confirmed" ? "bg-blue-900 text-blue-200" :
                                session.status === "scheduled" ? "bg-yellow-900 text-yellow-200" :
                                session.status === "completed" ? "bg-green-900 text-green-200" :
                                "bg-red-900 text-red-200"
                              }`}
                            >
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {(session.status === "confirmed" || session.status === "scheduled") && (
                                <>
                                  <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700 bg-gray-800 hover:bg-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-300" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700 bg-gray-800 hover:bg-gray-700 text-red-500 hover:text-red-400">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {session.status === "completed" && (
                                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700 bg-gray-800 hover:bg-gray-700">
                                  <FileText className="h-4 w-4 text-gray-300" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}