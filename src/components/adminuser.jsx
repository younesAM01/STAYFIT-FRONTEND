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
    nationality: "",
    // Client specific fields
    weight: "",
    height: "",
    goals: [],
    diseases: [],
    // Coach specific fields
    rating: 0,
    reviews: 0,
    specialties: [],
    certifications: [],
    aboutContent: {
      paragraphs: [],
      languages: []
    },
    heroContent: {
      name: "",
      title: "",
      image: ""
    },
    hoverImage: ""
  })
  const [roleFilter, setRoleFilter] = useState('all')

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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (!selectedUser?.supabaseId) {
        throw new Error('No user selected for update');
      }

      const response = await fetch(`/api/users?supabaseId=${selectedUser.supabaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.supabaseId === updatedUser.supabaseId ? updatedUser : user
        )
      );
      setShowEditForm(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser?.supabaseId) {
        throw new Error('No user selected for deletion');
      }

      const response = await fetch(`/api/users?supabaseId=${selectedUser.supabaseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete user');
      }

      // Remove the user from the local state
      setUsers(prevUsers => 
        prevUsers.filter(user => user.supabaseId !== selectedUser.supabaseId)
      );
      
      // Close the dialog and reset selected user
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role,
      preferredLanguage: user.preferredLanguage || "",
      nationality: user.nationality || "",
      weight: user.weight || "",
      height: user.height || "",
      goals: user.goals || [],
      diseases: user.diseases || [],
      rating: user.rating || 0,
      reviews: user.reviews || 0,
      specialties: user.specialties || [],
      certifications: user.certifications || [],
      aboutContent: user.aboutContent || { paragraphs: [], languages: [] },
      heroContent: user.heroContent || { name: "", title: "", image: "" },
      hoverImage: user.hoverImage || ""
    });
    setShowEditForm(true);
  };

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
    const matchesSearch = searchFields.some((field) => field.includes(query));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Clients</CardTitle>
                <User className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{clientsCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Coaches</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{coachesCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Admins</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{adminsCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input 
                type="search" 
                placeholder="Search users..." 
                className="w-[200px] pl-8 bg-gray-300 text-black placeholder:text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card className="bg-gray-900 border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">All Users</CardTitle>
                  <CardDescription className="text-white/60">Manage users, roles, and account information</CardDescription>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant={roleFilter === 'all' ? "default" : "outline"}
                    className={roleFilter === 'all' ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer" : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"}
                    onClick={() => setRoleFilter('all')}
                  >
                    All Users
                  </Button>
                  <Button 
                    variant={roleFilter === 'client' ? "default" : "outline"}
                    className={roleFilter === 'client' ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer" : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"}
                    onClick={() => setRoleFilter('client')}
                  >
                    Clients
                  </Button>
                  <Button 
                    variant={roleFilter === 'coach' ? "default" : "outline"}
                    className={roleFilter === 'coach' ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer" : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"}
                    onClick={() => setRoleFilter('coach')}
                  >
                    Coaches
                  </Button>
                  <Button 
                    variant={roleFilter === 'admin' ? "default" : "outline"}
                    className={roleFilter === 'admin' ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer" : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"}
                    onClick={() => setRoleFilter('admin')}
                  >
                    Admins
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
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Name</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Email</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Phone</th>
                        <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Role</th>
                        {roleFilter === 'client' && (
                          <>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Weight</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Height</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Goals</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Diseases</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Created</th>
                          </>
                        )}
                        {roleFilter === 'coach' && (
                          <>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Rating</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Reviews</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Specialties</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Certifications</th>
                            <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Created</th>
                          </>
                        )}
                        {roleFilter === 'all' && (
                          <th className="h-10 px-4 text-left text-sm font-medium text-white/60 border-r border-white/10">Created</th>
                        )}
                        <th className="h-10 px-4 text-right text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={roleFilter === 'all' ? 6 : roleFilter === 'client' ? 10 : roleFilter === 'coach' ? 10 : 6} className="p-4 text-center text-white">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((user) => (
                          <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-4 text-sm font-medium text-white border-r border-white/10">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              {user.email}
                            </td>
                            <td className="p-4 text-sm text-white border-r border-white/10">
                              {user.phoneNumber || "—"}
                            </td>
                            <td className={`p-4 text-sm ${getRoleColor(user.role)} border-r border-white/10`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </td>
                            {roleFilter === 'client' && (
                              <>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.weight ? `${user.weight} kg` : "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.height ? `${user.height} cm` : "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.goals?.length > 0 ? user.goals.join(', ') : "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.diseases?.length > 0 ? user.diseases.join(', ') : "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {formatDate(user.createdAt)}
                                </td>
                              </>
                            )}
                            {roleFilter === 'coach' && (
                              <>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.rating || "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.reviews || "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.specialties?.length > 0 ? user.specialties.map(s => s.title).join(', ') : "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {user.certifications?.length > 0 ? user.certifications.map(c => c.title).join(', ') : "—"}
                                </td>
                                <td className="p-4 text-sm text-white border-r border-white/10">
                                  {formatDate(user.createdAt)}
                                </td>
                              </>
                            )}
                            {roleFilter === 'all' && (
                              <td className="p-4 text-sm text-white border-r border-white/10">
                                {formatDate(user.createdAt)}
                              </td>
                            )}
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
                                      handleEditClick(user)
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

              {/* Client Specific Fields */}
              {formData.role === 'client' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-weight">Weight (kg)</Label>
                      <Input
                        id="edit-weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="bg-[#121212] border-white/10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-height">Height (cm)</Label>
                      <Input
                        id="edit-height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        className="bg-[#121212] border-white/10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-goals">Goals (comma separated)</Label>
                    <Input
                      id="edit-goals"
                      value={formData.goals.join(', ')}
                      onChange={(e) => setFormData({...formData, goals: e.target.value.split(',').map(g => g.trim())})}
                      className="bg-[#121212] border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-diseases">Diseases (comma separated)</Label>
                    <Input
                      id="edit-diseases"
                      value={formData.diseases.join(', ')}
                      onChange={(e) => setFormData({...formData, diseases: e.target.value.split(',').map(d => d.trim())})}
                      className="bg-[#121212] border-white/10"
                    />
                  </div>
                </>
              )}

              {/* Coach Specific Fields */}
              {formData.role === 'coach' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-rating">Rating</Label>
                      <Input
                        id="edit-rating"
                        type="number"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: e.target.value})}
                        className="bg-[#121212] border-white/10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-reviews">Reviews Count</Label>
                      <Input
                        id="edit-reviews"
                        type="number"
                        value={formData.reviews}
                        onChange={(e) => setFormData({...formData, reviews: e.target.value})}
                        className="bg-[#121212] border-white/10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-specialties">Specialties (comma separated)</Label>
                    <Input
                      id="edit-specialties"
                      value={formData.specialties.map(s => s.title).join(', ')}
                      onChange={(e) => setFormData({
                        ...formData, 
                        specialties: e.target.value.split(',').map(s => ({title: s.trim(), description: ''}))
                      })}
                      className="bg-[#121212] border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-certifications">Certifications (comma separated)</Label>
                    <Input
                      id="edit-certifications"
                      value={formData.certifications.map(c => c.title).join(', ')}
                      onChange={(e) => setFormData({
                        ...formData, 
                        certifications: e.target.value.split(',').map(c => ({title: c.trim(), org: ''}))
                      })}
                      className="bg-[#121212] border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-about">About Content (paragraphs, comma separated)</Label>
                    <Input
                      id="edit-about"
                      value={formData.aboutContent.paragraphs.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData, 
                        aboutContent: {
                          ...formData.aboutContent,
                          paragraphs: e.target.value.split(',').map(p => p.trim())
                        }
                      })}
                      className="bg-[#121212] border-white/10"
                    />
                  </div>
                </>
              )}

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
              <Button type="submit" className="bg-[#B4E90E] text-black hover:bg-[#B4E90E]">
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
              className="text-white hover:bg-white/10"
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