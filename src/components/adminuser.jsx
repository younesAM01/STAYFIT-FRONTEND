"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MoreHorizontal, UserPlus, User, Search, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSidebar } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { state } = useSidebar()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "client",
    preferredLanguage: "",
    nationality: ""
  })

  useEffect(() => {
    // Load all users
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchUsers();
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch users')
      }
      
      const data = await response.json()
      console.log("Users data:", data)
      setUsers(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
      throw err
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
        throw new Error('Required fields are missing')
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add user')
      }
      
      const data = await response.json()
      console.log("New user created:", data)
      
      // Refresh the users list
      await fetchUsers()
      
      // Reset form and close dialog
      setShowAddForm(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        role: "client",
        preferredLanguage: "",
        nationality: ""
      })
    } catch (err) {
      console.error('Error adding user:', err)
      setError(err.message)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
        throw new Error('Required fields are missing')
      }

      if (!selectedUser?.supabaseId) {
        throw new Error('No user selected for update')
      }

      const response = await fetch(`/api/users?supabaseId=${selectedUser.supabaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update user')
      }
      
      const data = await response.json()
      console.log("User updated:", data)
      
      // Update the users state immediately with the new data
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === selectedUser._id 
          ? {
              ...user,
              ...formData
            }
          : user
      ))
      
      setShowEditForm(false)
      setSelectedUser(null)
      setError(null)
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err.message)
    }
  }

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser?.supabaseId) {
        throw new Error('No user selected for deletion')
      }

      const response = await fetch(`/api/users?supabaseId=${selectedUser.supabaseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete user')
      }
      
      const data = await response.json()
      console.log("User deleted:", data)
      
      // Remove the deleted user from state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUser._id))
      
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err.message)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super admin':
        return 'text-purple-500'
      case 'admin':
        return 'text-red-500'
      case 'coach':
        return 'text-blue-500'
      case 'client':
        return 'text-green-500'
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

  const filteredData = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email ? user.email.toLowerCase() : '';
    const role = user.role ? user.role.toLowerCase() : '';
    const phoneNumber = user.phoneNumber ? user.phoneNumber.toLowerCase() : '';
    const nationality = user.nationality ? user.nationality.toLowerCase() : '';
    
    const searchFields = [
      fullName,
      email,
      role,
      phoneNumber,
      nationality
    ];
    
    const query = searchQuery.toLowerCase();
    return searchFields.some((field) => field.includes(query));
  });

  // Count users by role
  const clientsCount = users.filter(user => user.role === 'client').length
  const coachesCount = users.filter(user => user.role === 'coach').length
  const adminsCount = users.filter(user => user.role === 'admin' || user.role === 'super admin').length

  return (
    <div className="flex">
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        state === "collapsed" ? "ml-40" : "ml-18"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Users</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input 
                  type="search" 
                  placeholder="Search users..." 
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
                <CardTitle className="text-sm font-medium text-white">Clients</CardTitle>
                <User className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{clientsCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Coaches</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{coachesCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Admins</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{adminsCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#121212] border-0">
            <CardHeader>
              <CardTitle className="text-white">All Users</CardTitle>
              <CardDescription className="text-white/60">Manage users, roles, and account information</CardDescription>
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
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Name</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Email</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Phone</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Role</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60">Created</th>
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-white">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((user) => (
                          <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4 text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="p-4 text-sm text-white">
                              {user.email}
                            </td>
                            <td className="p-4 text-sm text-white">
                              {user.phoneNumber || "—"}
                            </td>
                            <td className={`p-4 text-sm ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </td>
                            <td className="p-4 text-sm text-white">
                              {formatDate(user.createdAt)}
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
                                      setSelectedUser(user)
                                      setFormData({
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                        phoneNumber: user.phoneNumber || "",
                                        address: user.address || "",
                                        role: user.role,
                                        preferredLanguage: user.preferredLanguage || "",
                                        nationality: user.nationality || ""
                                      })
                                      setShowEditForm(true)
                                    }}
                                  >
                                    Edit user
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    Delete user
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
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-[#121212] border-white/10"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="bg-[#121212] border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-[#121212] border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="bg-[#121212] border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Input
                    id="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
                    className="bg-[#121212] border-white/10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Add User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-white/60">
              Update user information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-[#121212] border-white/10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-[#121212] border-white/10"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                  <Input
                    id="edit-phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="bg-[#121212] border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-white/10">
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-[#121212] border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nationality">Nationality</Label>
                  <Input
                    id="edit-nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="bg-[#121212] border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-preferredLanguage">Preferred Language</Label>
                  <Input
                    id="edit-preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
                    className="bg-[#121212] border-white/10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black hover:bg-gray-100">
                Update User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1F1F1F] text-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this user? This action cannot be undone.
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
              onClick={handleDeleteUser}
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