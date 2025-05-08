"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  MoreHorizontal,
  UserPlus,
  User,
  Search,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "next-intl";
import { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation, useGetCoachQuery } from "@/redux/services/user.service";
import { toast } from "sonner";

export default function UsersPage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useSidebar();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
    coachActive: false,
    specialties: [],
    certifications: [],
    aboutContent: {
      paragraphs: [],
      languages: []
    },
    title: {
      en: "",
      ar: ""
    },
    available: {
      en: "",
      ar: ""
    },
    hoverImage: ""
  });
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: Response, isLoading: isLoadingUsers, error: fetchError, refetch } = useGetUserQuery();
  const { data: coachesResponse, isLoading: isLoadingCoaches } = useGetCoachQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    console.log('Users Response:', Response);
    if (Response) {
      // Handle different response formats
      let usersData = [];
      if (Array.isArray(Response)) {
        usersData = Response;
      } else if (Response.data) {
        usersData = Response.data;
      } else if (Response.users) {
        usersData = Response.users;
      }
      console.log('Processed Users Data:', usersData);
      setUsers(usersData);
    }
  }, [Response]);

  useEffect(() => {
    console.log('Coaches Response:', coachesResponse);
    if (coachesResponse) {
      // Handle different response formats
      let coachesData = [];
      if (Array.isArray(coachesResponse)) {
        coachesData = coachesResponse;
      } else if (coachesResponse.data) {
        coachesData = coachesResponse.data;
      } else if (coachesResponse.coaches) {
        coachesData = coachesResponse.coaches;
      }
      console.log('Processed Coaches Data:', coachesData);
      setCoaches(coachesData);
    }
  }, [coachesResponse]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (!selectedUser?._id) {
        throw new Error("No user selected for update");
      }

      // Prepare the update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: formData.role,
        nationality: formData.nationality,
        preferredLanguage: formData.preferredLanguage,
        // Client specific fields
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        goals: formData.goals,
        diseases: formData.diseases,
        // Coach specific fields
        coachActive: formData.coachActive,
        specialties: formData.specialties,
        certifications: formData.certifications,
        aboutContent: formData.aboutContent,
        title: formData.title,
        available: formData.available,
        hoverImage: formData.hoverImage
      };

      console.log('Updating user with data:', updateData);

      const result = await updateUser({
        id: selectedUser._id,
        user: updateData
      }).unwrap();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update user');
      }

      setShowEditForm(false);
      setSelectedUser(null);
      toast.success(result.message || 'User updated successfully!');
      refetch(); // Refresh the users list
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser?._id) {
        throw new Error('No user selected for deletion');
      }

      const result = await deleteUser(selectedUser._id).unwrap();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete user');
      }

      setShowDeleteDialog(false);
      setSelectedUser(null);
      toast.success(result.message || 'User deleted successfully!');
      refetch(); // Refresh the users list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    
    // Initialize form data with user's current data
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role || "client",
      preferredLanguage: user.preferredLanguage || "",
      nationality: user.nationality || "",
      // Client specific fields
      weight: user.weight || "",
      height: user.height || "",
      goals: user.goals || [],
      diseases: user.diseases || [],
      // Coach specific fields
      coachActive: user.coachActive || false,
      specialties: user.specialties || [],
      certifications: user.certifications || [],
      aboutContent: user.aboutContent || { 
        paragraphs: { en: [], ar: [] },
        languages: [] 
      },
      title: user.title || { en: "", ar: "" },
      available: user.available || { en: "", ar: "" },
      hoverImage: user.hoverImage || ""
    });
    
    setShowEditForm(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super admin":
        return "text-purple-500";
      case "admin":
        return "text-red-500";
      case "coach":
        return "text-blue-500";
      case "client":
        return "text-green-500";
      default:
        return "text-white";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  // Combine users and coaches based on role filter
  const allUsers = [...users, ...coaches];
  console.log('All Users:', allUsers);

  const filteredData = allUsers.filter((user) => {
    if (!user) return false;
    
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email ? user.email.toLowerCase() : "";
    const role = user.role ? user.role.toLowerCase() : "";
    const phoneNumber = user.phoneNumber ? user.phoneNumber.toLowerCase() : "";
    const nationality = user.nationality ? user.nationality.toLowerCase() : "";

    const searchFields = [fullName, email, role, phoneNumber, nationality];

    const query = searchQuery.toLowerCase();
    const matchesSearch = searchFields.some((field) => field.includes(query));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Count users by role
  const clientsCount = users.filter((user) => user.role === "client").length;
  const coachesCount = users.filter((user) => user.role === "coach").length;
  const adminsCount = users.filter(
    (user) => user.role === "admin" || user.role === "super admin"
  ).length;

  // Add loading states to the UI
  if (isLoadingUsers || isLoadingCoaches) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

  if (fetchError) {
    console.error('Fetch Error:', fetchError);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error loading users: {fetchError.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6">Users</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6 w-full min-w-0">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Clients</CardTitle>
                <User className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{clientsCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Coaches</CardTitle>
                <Users className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{coachesCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-3">Admins</CardTitle>
                <Shield className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{adminsCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t border-white/10 my-6"></div>

          <div className="flex flex-col sm:flex-row justify-end items-center mb-3 sm:mb-6 gap-2 sm:gap-x-3 w-full">
            <div className="relative w-full sm:w-[200px] mr-7">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8 bg-gray-300 border-0 text-black placeholder:text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card className="bg-gray-900 border-0 w-full min-w-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">All Users</CardTitle>
                  <CardDescription className="text-white/60">
                    Manage users, roles, and account information
                  </CardDescription>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant={roleFilter === "all" ? "default" : "outline"}
                    className={
                      roleFilter === "all"
                        ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer"
                        : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"
                    }
                    onClick={() => setRoleFilter("all")}
                  >
                    All Users
                  </Button>
                  <Button
                    variant={roleFilter === "client" ? "default" : "outline"}
                    className={
                      roleFilter === "client"
                        ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer"
                        : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"
                    }
                    onClick={() => setRoleFilter("client")}
                  >
                    Clients
                  </Button>
                  <Button
                    variant={roleFilter === "coach" ? "default" : "outline"}
                    className={
                      roleFilter === "coach"
                        ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer"
                        : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"
                    }
                    onClick={() => setRoleFilter("coach")}
                  >
                    Coaches
                  </Button>
                  <Button
                    variant={roleFilter === "admin" ? "default" : "outline"}
                    className={
                      roleFilter === "admin"
                        ? "bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer"
                        : "bg-gray-300 text-black hover:bg-gray-300 cursor-pointer"
                    }
                    onClick={() => setRoleFilter("admin")}
                  >
                    Admins
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isUpdating || isDeleting ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-white">Processing...</div>
                </div>
              ) : (
                <div className="block w-full overflow-x-auto rounded-md">
                  <table className="w-full min-w-full md:min-w-[700px] border-collapse text-xs sm:text-sm md:text-base">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="border-b border-white/10">
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Name</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Email</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Phone</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Role</th>
                        {roleFilter === "client" && (
                          <>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Weight</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Height</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Goals</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Diseases</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Created</th>
                          </>
                        )}
                        {roleFilter === "coach" && (
                          <>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Active Status</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Specialties</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Certifications</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Title</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Available For</th>
                            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Created</th>
                          </>
                        )}
                        {roleFilter === "all" && (
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">Created</th>
                        )}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={
                              roleFilter === "all"
                                ? 6
                                : roleFilter === "client"
                                  ? 10
                                  : roleFilter === "coach"
                                    ? 10
                                    : 6
                            }
                            className="p-4 text-center text-white border-b border-white/10"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((user) => (
                          <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium text-white border-r border-white/10">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {user.email}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {user.phoneNumber || "—"}
                            </td>
                            <td className={`px-2 py-2 sm:px-4 sm:py-3 text-sm ${getRoleColor(user.role)} border-r border-white/10`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </td>
                            {roleFilter === "client" && (
                              <>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.weight ? `${user.weight} kg` : "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.height ? `${user.height} cm` : "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.goals?.length > 0 ? user.goals.join(", ") : "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.diseases?.length > 0 ? user.diseases.join(", ") : "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {formatDate(user.createdAt)}
                                </td>
                              </>
                            )}
                            {roleFilter === "coach" && (
                              <>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.coachActive ? (
                                    <span className="text-green-500">Active</span>
                                  ) : (
                                    <span className="text-red-500">Inactive</span>
                                  )}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.specialties?.length > 0
                                    ? user.specialties.map((s) => s.title[locale]).join(", ")
                                    : "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.certifications?.length > 0
                                    ? user.certifications.map((c) => c.title[locale]).join(", ")
                                    : "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.title?.[locale] || "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {user.available?.[locale] || "—"}
                                </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                  {formatDate(user.createdAt)}
                                </td>
                              </>
                            )}
                            {roleFilter === "all" && (
                              <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                                {formatDate(user.createdAt)}
                              </td>
                            )}
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
                                    onClick={() => handleEditClick(user)}
                                  >
                                    Edit user
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowDeleteDialog(true);
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
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-white/60">
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-firstName">First Name</Label>
                    <Input
                      id="edit-firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lastName">Last Name</Label>
                    <Input
                      id="edit-lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                    <Input
                      id="edit-phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10">
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Client Specific Fields */}
                {formData.role === "client" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-weight">Weight (kg)</Label>
                        <Input
                          id="edit-weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-height">Height (cm)</Label>
                        <Input
                          id="edit-height"
                          type="number"
                          value={formData.height}
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                          className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-goals">Goals (comma separated)</Label>
                      <Input
                        id="edit-goals"
                        value={formData.goals.join(", ")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            goals: e.target.value.split(",").map((g) => g.trim()),
                          })
                        }
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-diseases">Diseases (comma separated)</Label>
                      <Input
                        id="edit-diseases"
                        value={formData.diseases.join(", ")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            diseases: e.target.value.split(",").map((d) => d.trim()),
                          })
                        }
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      />
                    </div>
                  </>
                )}

                {/* Coach Specific Fields */}
                {formData.role === "coach" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-active">Active Status</Label>
                      <Select
                        value={formData.coachActive ? "active" : "inactive"}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            coachActive: value === "active",
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-specialties">Specialties (comma separated)</Label>
                      <Input
                        id="edit-specialties"
                        value={formData.specialties.map((s) => s.title[locale]).join(", ")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialties: e.target.value.split(",").map((s) => ({
                              title: { [locale]: s.trim() },
                              description: "",
                            })),
                          })
                        }
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-certifications">Certifications (comma separated)</Label>
                      <Input
                        id="edit-certifications"
                        value={formData.certifications.map((c) => c.title[locale]).join(", ")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            certifications: e.target.value.split(",").map((c) => ({
                              title: { [locale]: c.trim() },
                              org: "",
                            })),
                          })
                        }
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={formData.title[locale]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: {
                              ...formData.title,
                              [locale]: e.target.value,
                            },
                          })
                        }
                        className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-available">Available For</Label>
                      <Select
                        value={formData.available[locale]}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            available: {
                              ...formData.available,
                              [locale]: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10">
                          <SelectItem value="Available only for women">Available only for women</SelectItem>
                          <SelectItem value="Available for all">Available for all</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nationality">Nationality</Label>
                    <Input
                      id="edit-nationality"
                      value={formData.nationality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nationality: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-preferredLanguage">Preferred Language</Label>
                    <Input
                      id="edit-preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferredLanguage: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    />
                  </div>
                </div>
              </div>
            </form>
            <DialogFooter className="mt-4 border-t border-white/10 pt-4">
              <Button
                onClick={handleUpdateUser}
                className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
              >
                Update User
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this user? This action cannot be undone.
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
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}