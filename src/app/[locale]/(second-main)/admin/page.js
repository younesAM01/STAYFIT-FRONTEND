"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Clock, Package, Star, Briefcase, ArrowUpRight, Users } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [monthlyData, setMonthlyData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [services, setServices] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [packs, setPacks] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Fetch all necessary data in parallel
        const [usersResponse, packsResponse, sessionsResponse, reviewsResponse, servicesResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/packs'),
          fetch('/api/session'),
          fetch('/api/review'),
          fetch('/api/services')
        ])

        if (!usersResponse.ok || !packsResponse.ok || !sessionsResponse.ok || !reviewsResponse.ok || !servicesResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [usersData, packsData, sessionsData, reviewsData, servicesData] = await Promise.all([
          usersResponse.json(),
          packsResponse.json(),
          sessionsResponse.json(),
          reviewsResponse.json(),
          servicesResponse.json()
        ])

        // Process users data
        const clients = usersData.filter(user => user.role === 'client')
        const coaches = usersData.filter(user => user.role === 'coach')

        // Process sessions data for monthly chart
        const currentMonth = new Date().getMonth()
        const monthlySessions = Array(12).fill(0)
        
        // Handle sessions data (direct array response)
        const sessions = Array.isArray(sessionsData) ? sessionsData : []
        sessions.forEach(session => {
          if (session.sessionDate) {
            const sessionMonth = new Date(session.sessionDate).getMonth()
            monthlySessions[sessionMonth]++
          }
        })

        // Get active sessions (scheduled)
        const activeSessions = sessions.filter(session => {
          return session.status === 'scheduled'
        })

        // Process packs data
        setPacks(packsData)

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const processedMonthlyData = months.map((month, index) => ({
          name: month,
          sessions: monthlySessions[index]
        }))

        // Process reviews data (response with data property)
        const reviews = reviewsData.data || []

        // Process services data
        const services = servicesData.data || []

        // Process performance data
        const processedPerformanceData = [
          { name: "Clients", value: clients.length, count: `${clients.length} active clients` },
          { name: "Client Packs", value: packsData.length, count: `${packsData.length} total packs` },
          { name: "Sessions", value: sessions.length, count: `${sessions.length} this month` },
          { name: "Reviews", value: reviews.length, count: `${reviews.length} total reviews` }
        ]

        setMonthlyData(processedMonthlyData)
        setPerformanceData(processedPerformanceData)
        setServices(services)
        setActiveSessions(activeSessions)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Helper function to get pack category
  const getPackCategory = (packId) => {
    const pack = packs.find(p => p._id === packId)
    return pack ? pack.category?.en || 'Unknown Category' : 'Unknown Category'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d111a] text-white">
        <div>Loading dashboard data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d111a] text-red-500">
        <div>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-[#0d111a] text-white min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-medium text-[#B4E90E]">Overview</h3>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Client Packs</CardTitle>
              <Package className="h-4 w-4 text-[#B4E90E]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{performanceData[1]?.value || 0}</div>
              <div className="flex items-center mt-1 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-500">+12%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Reviews</CardTitle>
              <Star className="h-4 w-4 text-[#B4E90E]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{performanceData[3]?.value || 0}</div>
              <div className="flex items-center mt-1 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-500">+18%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Clients</CardTitle>
              <Users className="h-4 w-4 text-[#B4E90E]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{performanceData[0]?.value || 0}</div>
              <div className="flex items-center mt-1 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-500">+5%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Sessions</CardTitle>
              <Clock className="h-4 w-4 text-[#B4E90E]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{performanceData[2]?.value || 0}</div>
              <div className="flex items-center mt-1 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-500">+24%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#B4E90E]">Session Overview</CardTitle>
              <CardDescription className="text-gray-400">Activity across all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] text-gray-400">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#4b5563"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(180, 233, 14, 0.1)" }}
                      contentStyle={{
                        backgroundColor: "#1c2333",
                        borderColor: "#374151",
                        color: "#fff",
                        borderRadius: "4px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      labelStyle={{ color: "#B4E90E", fontWeight: "bold", marginBottom: "5px" }}
                      formatter={(value) => [`${value} sessions`, ""]}
                    />
                    <Bar dataKey="sessions" radius={[4, 4, 0, 0]} fill="#B4E90E" animationDuration={500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#B4E90E]">Performance Analytics</CardTitle>
              <CardDescription className="text-gray-400">Key metrics distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#B4E90E" : index === 1 ? "#8EBB0C" : index === 2 ? "#688D09" : "#425E06"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-[#1c2333] border border-[#374151] rounded-md p-3 shadow-lg">
                              <p className="font-medium text-[#B4E90E] mb-1">{data.name}</p>
                              <p className="text-white text-sm">{data.count}</p>
                              <p className="text-gray-400 text-xs mt-1">
                                {data.name === "Clients"
                                  ? "Total active clients"
                                  : data.name === "Client Packs"
                                    ? "Available client packages"
                                    : data.name === "Sessions"
                                      ? "Active sessions this month"
                                      : "Total customer reviews"}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#B4E90E]">Available Services</CardTitle>
              <CardDescription className="text-gray-400">Our current service offerings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-8 text-center text-gray-400">{i + 1}.</div>
                    <div className="flex-1 text-white">{service.title?.en || 'Unnamed Service'}</div>
                    <div className="font-medium text-[#B4E90E]">Active</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b26] border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#B4E90E]">Active Sessions</CardTitle>
              <CardDescription className="text-gray-400">Currently scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.length > 0 ? (
                  activeSessions.map((session, i) => (
                    <div key={i} className="flex flex-col space-y-1 pb-3 border-b border-gray-800 last:border-0">
                      <div className="flex justify-between">
                        <span className="font-medium text-white">{getPackCategory(session.pack)} Session</span>
                        <span className="text-sm text-[#B4E90E]">Scheduled</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(session.sessionDate).toLocaleDateString()} • {session.sessionTime} • {session.location}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">No scheduled sessions at the moment</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
