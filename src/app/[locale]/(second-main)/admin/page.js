"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Clock, Package, Star, Briefcase, ArrowUpRight, Users, Ticket } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from 'date-fns'
import { useGetClientPacksQuery } from "@/redux/services/clientpack.service"
import { useGetUserQuery } from "@/redux/services/user.service"
import { useGetSessionsQuery } from "@/redux/services/session.service"
import { useGetReviewsQuery } from "@/redux/services/review.service"
import { 
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation
} from "@/redux/services/coupon.service"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [monthlyData, setMonthlyData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [newCoupon, setNewCoupon] = useState({ name: '', percentage: '', expiryDate: '' })
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [clientPacksCount, setClientPacksCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)

  // RTK Query hooks for data
  const { data: response = { success: false, clientPacks: [] }, isLoading: clientPacksLoading, error: clientPacksError } = useGetClientPacksQuery()
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUserQuery()
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useGetSessionsQuery()
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useGetReviewsQuery()
  const { data: couponsData, isLoading: couponsLoading, error: couponsError } = useGetCouponsQuery()
  const [createCoupon] = useCreateCouponMutation()
  const [updateCoupon] = useUpdateCouponMutation()
  const [deleteCoupon] = useDeleteCouponMutation()

  // Process client packs data
  useEffect(() => {
    if (response?.clientPacks) {
      setClientPacksCount(response.clientPacks.length)
    }
  }, [response])

  // Process clients data
  useEffect(() => {
    if (usersData?.users) {
      const clients = usersData.users.filter(user => user.role === 'client')
      setClientsCount(clients.length)
    }
  }, [usersData])

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
        // Only show loading if we're actually fetching data
        if (!sessionsData || !reviewsData) {
          toast.loading('Loading dashboard data...')
        }
        
        // Process sessions data for monthly chart
        const currentMonth = new Date().getMonth()
        const monthlySessions = Array(12).fill(0)
        
        // Handle sessions data from Redux
        const sessions = sessionsData?.sessions || []
        sessions.forEach(session => {
          if (session.sessionDate) {
            const sessionMonth = new Date(session.sessionDate).getMonth()
            monthlySessions[sessionMonth]++
          }
        })

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const processedMonthlyData = months.map((month, index) => ({
          name: month,
          sessions: monthlySessions[index]
        }))

        // Process reviews data from Redux
        const reviews = reviewsData?.data || []

        // Process performance data
        const processedPerformanceData = [
          { name: "Clients", value: clientsCount, count: `${clientsCount} active clients` },
          { name: "Client Packs", value: clientPacksCount, count: `${clientPacksCount} total client packs` },
          { name: "Sessions", value: sessions.length, count: `${sessions.length} this month` },
          { name: "Reviews", value: reviews.length, count: `${reviews.length} total reviews` }
        ]

        setMonthlyData(processedMonthlyData)
        setPerformanceData(processedPerformanceData)
        toast.dismiss()
      } catch (err) {
        toast.error(err.message || 'Failed to fetch dashboard data')
      }
    }

    // Only fetch data if we have all the necessary data
    if (sessionsData && reviewsData) {
      fetchDashboardData()
    }
  }, [sessionsData, reviewsData, clientPacksCount, clientsCount])

  // Handle errors from Redux queries
  useEffect(() => {
    const errors = [clientPacksError, usersError, sessionsError, reviewsError, couponsError].filter(Boolean)
    if (errors.length > 0) {
      const errorMessage = errors[0].message || 'Failed to load dashboard data'
      toast.error(errorMessage)
    }
  }, [clientPacksError, usersError, sessionsError, reviewsError, couponsError])

  const handleAddCoupon = async () => {
    try {
      if (!newCoupon.name || !newCoupon.percentage || !newCoupon.expiryDate) {
        toast.error('Please fill in all coupon fields')
        return
      }

      const loadingToast = toast.loading('Adding coupon...')
      const result = await createCoupon({
        name: newCoupon.name,
        percentage: parseInt(newCoupon.percentage),
        expiryDate: newCoupon.expiryDate,
        status: 'active'
      }).unwrap()

      toast.dismiss(loadingToast)
      if (result.success) {
        setNewCoupon({ name: '', percentage: '', expiryDate: '' })
        toast.success('Coupon added successfully')
      } else {
        toast.error(result.message || 'Failed to add coupon')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add coupon')
    }
  }

  const handleUpdateCoupon = async (couponId) => {
    try {
      if (!editingCoupon.name || !editingCoupon.percentage || !editingCoupon.expiryDate) {
        toast.error('Please fill in all coupon fields')
        return
      }

      const loadingToast = toast.loading('Updating coupon...')
      const result = await updateCoupon({
        id: couponId,
        ...editingCoupon
      }).unwrap()

      toast.dismiss(loadingToast)
      if (result.success) {
        setEditingCoupon(null)
        toast.success('Coupon updated successfully')
      } else {
        toast.error(result.message || 'Failed to update coupon')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update coupon')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    try {
      const loadingToast = toast.loading('Deleting coupon...')
      const result = await deleteCoupon(couponId).unwrap()
      
      toast.dismiss(loadingToast)
      if (result.success) {
        toast.success('Coupon deleted successfully')
      } else {
        toast.error(result.message || 'Failed to delete coupon')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete coupon')
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6 w-full min-w-0">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Client Packs</CardTitle>
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

            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Reviews</CardTitle>
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

            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Clients</CardTitle>
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

            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Sessions</CardTitle>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
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

            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
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

          {/* Coupons Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
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
                      className="bg-gray-800 border-white/10 text-white focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Discount Percentage"
                      value={newCoupon.percentage}
                      onChange={(e) => setNewCoupon({ ...newCoupon, percentage: e.target.value })}
                      className="bg-gray-800 border-white/10 text-white focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                      className="bg-gray-800 border-white/10 text-white focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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

            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader>
                <CardTitle className="text-[#B4E90E]">Active Coupons</CardTitle>
                <CardDescription className="text-gray-400">Manage existing coupons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {couponsData?.data?.map((coupon) => (
                    <div key={coupon._id} className="flex flex-col space-y-2 pb-3 border-b border-gray-800 last:border-0">
                      {editingCoupon && editingCoupon._id === coupon._id ? (
                        <>
                          <Input
                            value={editingCoupon.name}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, name: e.target.value })}
                            className="bg-gray-800 border-white/10 text-white focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          />
                          <Input
                            type="number"
                            value={editingCoupon.percentage}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, percentage: e.target.value })}
                            className="bg-gray-800 border-white/10  text-white focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                          />
                          <Input
                            type="date"
                            value={editingCoupon.expiryDate}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                            className="bg-gray-800 border-white/10 text-white focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                  {couponsData?.data?.length === 0 && (
                    <div className="text-gray-400 text-center py-4">No active coupons</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}