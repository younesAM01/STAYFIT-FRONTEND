"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Clock, Package, Star, Briefcase, ArrowUpRight, Users, Ticket } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [monthlyData, setMonthlyData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [coupons, setCoupons] = useState([])
  const [newCoupon, setNewCoupon] = useState({ name: '', percentage: '', expiryDate: '' })
  const [editingCoupon, setEditingCoupon] = useState(null)

  // Helper function to safely format dates
  const formatExpiryDate = (dateString) => {
    try {
      if (!dateString) return 'No expiry date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'PP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Fetch all necessary data in parallel
        const [usersResponse, packsResponse, sessionsResponse, reviewsResponse, couponsResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/packs'),
          fetch('/api/session'),
          fetch('/api/review'),
          fetch('/api/coupon')
        ])

        if (!usersResponse.ok || !packsResponse.ok || !sessionsResponse.ok || !reviewsResponse.ok || !couponsResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [usersData, packsData, sessionsData, reviewsData, couponsData] = await Promise.all([
          usersResponse.json(),
          packsResponse.json(),
          sessionsResponse.json(),
          reviewsResponse.json(),
          couponsResponse.json()
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

        // Process coupons data
        setCoupons(couponsData.data || [])

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const processedMonthlyData = months.map((month, index) => ({
          name: month,
          sessions: monthlySessions[index]
        }))

        // Process reviews data
        const reviews = reviewsData.data || []

        // Process performance data
        const processedPerformanceData = [
          { name: "Clients", value: clients.length, count: `${clients.length} active clients` },
          { name: "Client Packs", value: packsData.length, count: `${packsData.length} total packs` },
          { name: "Sessions", value: sessions.length, count: `${sessions.length} this month` },
          { name: "Reviews", value: reviews.length, count: `${reviews.length} total reviews` }
        ]

        setMonthlyData(processedMonthlyData)
        setPerformanceData(processedPerformanceData)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleAddCoupon = async () => {
    try {
      const response = await fetch('/api/coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCoupon.name,
          percentage: parseInt(newCoupon.percentage),
          expiryDate: newCoupon.expiryDate,
          status: 'active'
        }),
      })

      if (!response.ok) throw new Error('Failed to add coupon')

      const result = await response.json()
      setCoupons([...coupons, result.coupon])
      setNewCoupon({ name: '', percentage: '', expiryDate: '' })
    } catch (error) {
      console.error('Error adding coupon:', error)
    }
  }

  const handleUpdateCoupon = async (couponId) => {
    try {
      const response = await fetch(`/api/coupon?id=${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCoupon),
      })

      if (!response.ok) throw new Error('Failed to update coupon')

      const result = await response.json()
      setCoupons(coupons.map(c => c._id === couponId ? result.coupon : c))
      setEditingCoupon(null)
    } catch (error) {
      console.error('Error updating coupon:', error)
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    try {
      const response = await fetch(`/api/coupon?id=${couponId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete coupon')

      setCoupons(coupons.filter(c => c._id !== couponId))
    } catch (error) {
      console.error('Error deleting coupon:', error)
    }
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
    <div className="space-y-6 p-6 text-white min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-medium text-[#B4E90E]">Overview</h3>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#161b26] border-gray-800 p-2">
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

          <Card className="bg-[#161b26] border-gray-800 p-2">
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

          <Card className="bg-[#161b26] border-gray-800 p-2">
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

          <Card className="bg-[#161b26] border-gray-800 p-2">
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
          <Card className="bg-[#161b26] border-gray-800 p-2">
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

          <Card className="bg-[#161b26] border-gray-800 p-2">
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
          <Card className="bg-[#161b26] border-gray-800 p-2">
            <CardHeader>
              <CardTitle className="text-[#B4E90E]">Add New Coupon</CardTitle>
              <CardDescription className="text-gray-400">Create a new discount coupon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Coupon Name"
                    value={newCoupon.name}
                    onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                    className="bg-[#1c2333] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Discount Percentage"
                    value={newCoupon.percentage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, percentage: e.target.value })}
                    className="bg-[#1c2333] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="bg-[#1c2333] border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleAddCoupon}
                  className="w-full bg-[#B4E90E] text-black hover:bg-[#9ed00c]"
                >
                  Add Coupon
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b26] border-gray-800 p-2">
            <CardHeader>
              <CardTitle className="text-[#B4E90E]">Active Coupons</CardTitle>
              <CardDescription className="text-gray-400">Manage existing coupons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon._id} className="flex flex-col space-y-2 pb-3 border-b border-gray-800 last:border-0">
                    {editingCoupon && editingCoupon._id === coupon._id ? (
                      <>
                        <Input
                          value={editingCoupon.name}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, name: e.target.value })}
                          className="bg-[#1c2333] border-gray-700 text-white"
                        />
                        <Input
                          type="number"
                          value={editingCoupon.percentage}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, percentage: e.target.value })}
                          className="bg-[#1c2333] border-gray-700 text-white"
                        />
                        <Input
                          type="date"
                          value={editingCoupon.expiryDate}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                          className="bg-[#1c2333] border-gray-700 text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateCoupon(coupon._id)}
                            className="flex-1 bg-[#B4E90E] text-black hover:bg-[#9ed00c]"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingCoupon(null)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white">{coupon.name}</span>
                          <span className="text-sm text-[#B4E90E]">{coupon.percentage}% OFF</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            Expires: {formatExpiryDate(coupon.expiryDate)}
                          </span>
                          <div className="space-x-2">
                            <Button
                              onClick={() => setEditingCoupon(coupon)}
                              className="bg-blue-600 hover:bg-blue-700"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="bg-red-600 hover:bg-red-700"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {coupons.length === 0 && (
                  <div className="text-gray-400 text-center py-4">No active coupons</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
