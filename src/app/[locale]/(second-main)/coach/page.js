"use client"

import { useEffect, useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

  // --- State for Calculated Stats ---
  const [monthlyStats, setMonthlyStats] = useState({
    scheduled: 0,
    completed: 0,
    canceled: 0,
    total: 0,
  });
  // --- End State for Calculated Stats ---

  console.log("Fetched Coach Sessions:", coachSessions) // Log fetched data

  const fetchCoachSessions = async (coachId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/session?coachId=${coachId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array, default to empty array if not
      setCoachSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching coach sessions:", error);
      setCoachSessions([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (coachId) {
      fetchCoachSessions(coachId);
    } else {
        setIsLoading(false); // Set loading to false if no coachId
        setCoachSessions([]); // Ensure sessions are empty if no coachId
    }
  }, [coachId]);

  // --- Calculate Stats for Cards ---
  useEffect(() => {
    if (!isLoading && coachSessions && coachSessions.length > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let scheduledCount = 0;
      let completedCount = 0;
      let canceledCount = 0;

      coachSessions.forEach(session => {
        try {
          // Ensure sessionDate is valid before creating a Date object
          if (session.sessionDate) {
             const sessionDate = new Date(session.sessionDate);
             // Check if date is valid before proceeding
             if (!isNaN(sessionDate.getTime())) {
                const sessionMonth = sessionDate.getMonth();
                const sessionYear = sessionDate.getFullYear();

                // Check if the session is in the current month and year
                if (sessionMonth === currentMonth && sessionYear === currentYear) {
                    // Use lowercase for status comparison for consistency
                    const status = session.status ? session.status.toLowerCase() : '';

                    if (status === 'scheduled' || status === 'confirmed') {
                      scheduledCount++;
                    } else if (status === 'completed') {
                      completedCount++;
                    } else if (status === 'canceled' || status === 'cancelled') { // Handle both spellings if necessary
                      canceledCount++;
                    }
                }
              } else {
                console.warn("Invalid sessionDate found:", session.sessionDate, "in session:", session._id);
              }
          } else {
             console.warn("Missing sessionDate in session:", session._id);
          }
        } catch (e) {
          console.error("Error processing session date:", session.sessionDate, e);
        }
      });

      setMonthlyStats({
        scheduled: scheduledCount,
        completed: completedCount,
        canceled: canceledCount,
        total: coachSessions.length, // Total count remains all-time
      });
      console.log("Calculated Monthly Stats:", { scheduledCount, completedCount, canceledCount, total: coachSessions.length }); // Log calculated stats
    } else if (!isLoading && (!coachSessions || coachSessions.length === 0)) {
        // Reset stats if there are no sessions or loading is finished
         setMonthlyStats({ scheduled: 0, completed: 0, canceled: 0, total: 0 });
         console.log("No sessions found or loading finished, resetting stats.");
    }
  }, [coachSessions, isLoading]);
  // --- End Calculate Stats for Cards ---


  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation variants (kept as is)
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

  // --- Updated Stats Data for Cards ---
  const sessionStatsCards = useMemo(() => [
      {
        title: "Sessions Scheduled",
        value: monthlyStats.scheduled.toString(), // Use calculated value
        icon: Clock,
        description: "This month", // Updated description
        // change: "+12%", // Removed or adjust logic if needed
        // changeType: "positive", // Removed or adjust logic if needed
      },
      {
        title: "Sessions Completed",
        value: monthlyStats.completed.toString(), // Use calculated value
        icon: CheckCircle,
        description: "This month", // Updated description
        // change: "+8%", // Removed or adjust logic if needed
        // changeType: "positive", // Removed or adjust logic if needed
      },
      {
        title: "Sessions Cancelled",
        value: monthlyStats.canceled.toString(), // Use calculated value
        icon: XCircle,
        description: "This month", // Updated description
        // change: "-2%", // Removed or adjust logic if needed
        // changeType: "negative", // Removed or adjust logic if needed
      },
      {
        title: "Total Sessions",
        value: monthlyStats.total.toString(), // Use calculated value
        icon: Calendar,
        description: "All time", // Kept as all time
        // change: "+24%", // Removed or adjust logic if needed
        // changeType: "positive", // Removed or adjust logic if needed
      },
    ], [monthlyStats]); // Dependency array includes monthlyStats
  // --- End Updated Stats Data for Cards ---

  // --- New Monthly Sessions Data Logic ---
  const monthlySessions = useMemo(() => {
    // Get current date
    const now = new Date();
    
    // Array to hold last 6 months data (including current month)
    const lastSixMonths = [];
    
    // Array of month names in English
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                         "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    
    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      // Create a new date for each month by going back i months
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      
      // Get month index (0-11)
      const monthIndex = monthDate.getMonth();
      
      // Get month name from the array
      const monthName = monthNames[monthIndex];
      
      // Add year for clarity if the range spans multiple years
      const label = now.getFullYear() !== monthDate.getFullYear() 
        ? `${monthName}`
        : monthName;
        
      // Initialize with structured object
      lastSixMonths.push({
        name: label,
        sessions: 0, // Will be populated with real data if available
        monthNum: monthIndex,
        year: monthDate.getFullYear()
      });
    }
    
    // Count sessions per month if session data is available
    if (coachSessions && coachSessions.length > 0) {
      coachSessions.forEach(session => {
        try {
          if (session.sessionDate) {
            const sessionDate = new Date(session.sessionDate);
            
            // Check if date is valid
            if (!isNaN(sessionDate.getTime())) {
              const sessionMonth = sessionDate.getMonth();
              const sessionYear = sessionDate.getFullYear();
              
              // Find if this session belongs to one of our 6 months
              const monthEntry = lastSixMonths.find(
                m => m.monthNum === sessionMonth && m.year === sessionYear
              );
              
              // If found, increment the session count (only count completed sessions)
              if (monthEntry && session.status && 
                  (session.status.toLowerCase() === 'completed' || 
                   session.status.toLowerCase() === 'confirmed' ||
                   session.status.toLowerCase() === 'scheduled')) {
                monthEntry.sessions++;
              }
            }
          }
        } catch (e) {
          console.error("Error counting monthly sessions:", e);
        }
      });
    }
    
    // Return the complete data object for the chart
    return lastSixMonths;
  }, [coachSessions]);
  // --- End New Monthly Sessions Data Logic ---

  // Client Satisfaction Data (kept as is)
  const clientSatisfactionData = [
    { name: "Week 1", satisfaction: 4.2 },
    { name: "Week 2", satisfaction: 4.5 },
    { name: "Week 3", satisfaction: 4.3 },
    { name: "Week 4", satisfaction: 4.7 },
    { name: "Week 5", satisfaction: 4.8 },
    { name: "Week 6", satisfaction: 4.6 },
  ]

  // --- Sorting Function for Table (Kept as is, but improved robustness) ---
  const sortCoachSessions = (sessions) => {
    // Return default structure if sessions are not valid
    if (!sessions || !Array.isArray(sessions)) {
      console.warn("sortCoachSessions called with invalid input:", sessions);
      return { upcoming: [], completed: [], cancelled: [] };
    }

    const currentDate = new Date();
    const sortedSessions = {
      upcoming: [],
      completed: [],
      cancelled: [] // Use consistent spelling
    };

    sessions.forEach(session => {
       // Basic check for session structure
      if (!session || typeof session !== 'object' || !session._id) {
         console.warn("Skipping invalid session object:", session);
         return;
      }
      const sessionStatus = session.status ? session.status.toLowerCase() : 'unknown';
      const clientFirstName = session.client?.firstName || '';
      const clientLastName = session.client?.lastName || '';
      const clientName = `${clientFirstName} ${clientLastName}`.trim() || "Unknown Client";
      const duration = `${session.duration || 60} min`;
      const sessionTime = session.sessionTime || "N/A"; // Handle missing time
      let sessionDateStr = "Invalid Date";
      let sessionDateObj = null;

      if (session.sessionDate) {
         try {
             sessionDateObj = new Date(session.sessionDate);
             if (!isNaN(sessionDateObj.getTime())) {
                sessionDateStr = sessionDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
             } else {
                 sessionDateObj = null; // Invalidate if parsing failed
                 console.warn("Invalid sessionDate format encountered during sort:", session.sessionDate);
             }
         } catch (e) {
             console.error("Error parsing session date during sort:", session.sessionDate, e);
             sessionDateObj = null; // Invalidate on error
         }
      } else {
         console.warn("Missing sessionDate in session during sort:", session._id);
      }


      const sessionData = {
        id: session._id,
        client: clientName,
        date: sessionDateStr,
        time: sessionTime,
        duration: duration,
        status: session.status || 'unknown' // Keep original case for display if needed, or use sessionStatus
      };

      if (sessionStatus === "cancelled" || sessionStatus === "canceled") { // Check both spellings
        sortedSessions.cancelled.push(sessionData);
      } else if (sessionStatus === "completed") {
        sortedSessions.completed.push(sessionData);
      } else if (sessionStatus === 'scheduled' || sessionStatus === 'confirmed') {
        // Only add to upcoming if the date is valid and in the future or today
        if (sessionDateObj && sessionDateObj >= currentDate.setHours(0,0,0,0)) { // Compare date part only
             sortedSessions.upcoming.push(sessionData);
        } else if (!sessionDateObj) {
             // Handle sessions with invalid/missing dates if needed, maybe add to a specific category or log
             console.warn(`Session ${session._id} with status ${sessionStatus} has invalid/missing date, not added to upcoming.`);
        }
        // Optionally, handle past sessions that are not completed/cancelled differently if needed
      } else {
         // Handle other statuses or past non-completed/non-cancelled sessions if necessary
          console.log(`Session ${session._id} has status: ${sessionStatus} - not categorized for table tabs.`);
          // Maybe add to upcoming if date is valid and in the future, regardless of specific status?
          // if (sessionDateObj && sessionDateObj >= currentDate.setHours(0,0,0,0)) {
          //    sortedSessions.upcoming.push(sessionData);
          // }
      }
    });

    // Helper function for robust date comparison during sort
    const getDateForSort = (session) => {
        try {
            // Attempt to reconstruct a sortable date object
            const date = new Date(`${session.date} ${session.time}`);
            return !isNaN(date.getTime()) ? date : new Date(0); // Return epoch if invalid
        } catch (e) {
            return new Date(0); // Return epoch on error
        }
    };


    // Sort upcoming sessions by date (earliest first)
    sortedSessions.upcoming.sort((a, b) => getDateForSort(a) - getDateForSort(b));

    // Sort completed and cancelled sessions by date (latest first)
    sortedSessions.completed.sort((a, b) => getDateForSort(b) - getDateForSort(a));
    sortedSessions.cancelled.sort((a, b) => getDateForSort(b) - getDateForSort(a));

    return sortedSessions;
  }

  // Use useMemo for sorted sessions to avoid recalculating on every render unless coachSessions changes
  const sortedSessionsForTable = useMemo(() => sortCoachSessions(coachSessions), [coachSessions]);
  // --- End Sorting Function for Table ---


  const mainColor = "#B4E90E"
  // const bgColor = "#0d111a" // Defined inline below, keeping variable for reference
  const textColor = "#FFFFFF" // Defined inline below, keeping variable for reference

  if (!mounted) {
    return null // Or a loading spinner
  }

  return (
    // Removed explicit min-h-screen and color, assuming parent provides background/text color
    <div className="container py-6"> {/* Added padding */}
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight text-white">Coach Dashboard</h1>
          <p className="text-gray-400">Monitor your coaching sessions and client progress</p>
        </motion.div>

        {/* --- Stats Cards Using Calculated Values --- */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Map over the dynamically generated card data */}
          {sessionStatsCards.map((stat, index) => (
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
                    {/* Render Icon component */}
                    <stat.icon className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="flex items-baseline justify-between">
                     {/* Display the value from state */}
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    {/* Removed change indicator, add back if needed */}
                    {/* <div className={`text-xs ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change}
                    </div> */}
                  </div>
                   {/* Display the description (e.g., "This month") */}
                  <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                   {/* Progress bar - kept original logic, may need adjustment */}
                  <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: mainColor }}
                      initial={{ width: 0 }}
                       // Base the animation on the stat value. Adjust the denominator (20) as needed for scale.
                      animate={{ width: `${(Number.parseInt(stat.value) / 20) * 100}%` }} // Adjusted denominator
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
         {/* --- End Stats Cards --- */}


        {/* Charts Section (Updated Monthly Sessions Chart) */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          {/* Monthly Sessions Chart - UPDATED */}
          <Card className="shadow-md bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white p-2">Monthly Sessions</CardTitle>
              <CardDescription className="text-gray-400">Number of sessions per month over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySessions}>
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
                    formatter={(value) => [`${value} sessions`, 'Sessions']}
                    labelFormatter={(label) => `${label}`}
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

        {/* Recent Activity with Sessions Table (Using sortedSessionsForTable) */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Coaching Sessions</CardTitle>
              <CardDescription className="text-gray-400">Manage all your scheduled sessions</CardDescription>
              <div className="flex space-x-1 mt-2 border-b border-gray-800">
                 <button
                   onClick={() => setActiveTab("upcoming")}
                   className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "upcoming" ? 'text-[#B4E90E] border-b-2 border-[#B4E90E]' : 'text-gray-400 hover:text-gray-300 border-b-2 border-transparent'}`}
                 >
                   Upcoming ({sortedSessionsForTable.upcoming.length})
                 </button>
                 <button
                   onClick={() => setActiveTab("completed")}
                   className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "completed" ? 'text-[#B4E90E] border-b-2 border-[#B4E90E]' : 'text-gray-400 hover:text-gray-300 border-b-2 border-transparent'}`}
                 >
                   Completed ({sortedSessionsForTable.completed.length})
                 </button>
                 <button
                   onClick={() => setActiveTab("cancelled")}
                   className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "cancelled" ? 'text-[#B4E90E] border-b-2 border-[#B4E90E]' : 'text-gray-400 hover:text-gray-300 border-b-2 border-transparent'}`}
                 >
                   Cancelled ({sortedSessionsForTable.cancelled.length})
                 </button>
              </div>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                 <div className="text-center py-10 text-gray-400">Loading sessions...</div>
               ) : sortedSessionsForTable[activeTab] && sortedSessionsForTable[activeTab].length > 0 ? (
                 <div className="rounded-md border border-gray-800 overflow-x-auto">
                    <Table>
                    <TableHeader className="bg-gray-800">
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300 whitespace-nowrap">Client</TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">Date</TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">Time</TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">Duration</TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">Status</TableHead>
                        <TableHead className="text-gray-300 text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                      <TableBody>
                        {sortedSessionsForTable[activeTab].map((session) => (
                          <TableRow key={session.id} className="hover:bg-gray-800/50 border-gray-800">
                            <TableCell className="font-medium text-white">{session.client}</TableCell>
                            <TableCell className="text-gray-300">{session.date}</TableCell>
                            <TableCell className="text-gray-300">{session.time}</TableCell>
                            <TableCell className="text-gray-300">{session.duration}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  session.status.toLowerCase() === "confirmed" ? "bg-blue-900 text-blue-200" :
                                  session.status.toLowerCase() === "scheduled" ? "bg-yellow-900 text-yellow-200" :
                                  session.status.toLowerCase() === "completed" ? "bg-green-900 text-green-200" :
                                  (session.status.toLowerCase() === "canceled" || session.status.toLowerCase() === "cancelled") ? "bg-red-900 text-red-200" :
                                  "bg-gray-700 text-gray-300" // Default badge
                                } capitalize`} // Added capitalize
                              >
                                {session.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Action Buttons (Kept as is) */}
                               <div className="flex justify-end gap-2">
                                  {(session.status.toLowerCase() === "confirmed" || session.status.toLowerCase() === "scheduled") && (
                                    <>
                                      <Button variant="outline" size="icon" title="Reschedule" className="h-8 w-8 border-gray-700 bg-gray-800 hover:bg-gray-700">
                                        <Calendar className="h-4 w-4 text-gray-300" />
                                      </Button>
                                      <Button variant="outline" size="icon" title="Cancel" className="h-8 w-8 border-gray-700 bg-gray-800 hover:bg-gray-700 text-red-500 hover:text-red-400">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {session.status.toLowerCase() === "completed" && (
                                    <Button variant="outline" size="icon" title="View Notes" className="h-8 w-8 border-gray-700 bg-gray-800 hover:bg-gray-700">
                                      <FileText className="h-4 w-4 text-gray-300" />
                                    </Button>
                                  )}
                                  {/* Add placeholder/button for cancelled if needed */}
                                </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 </div>
               ) : (
                   <div className="text-center py-10 text-gray-400">
                     No {activeTab} sessions found.
                   </div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}