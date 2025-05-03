"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  MoreHorizontal,
  Package,
  CalendarDays,
  User,
  Search,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { useLocale } from "next-intl";
import { useAuth } from "@/context/authContext";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetClientPacksQuery,
  useCreateClientPackMutation,
  useUpdateClientPackMutation,
  useDeleteClientPackMutation,
} from "@/redux/services/clientpack.service";
import { useGetUserQuery } from "@/redux/services/user.service";
import { useGetPacksQuery } from "@/redux/services/pack.service";
import { toast } from "sonner";

export default function ClientPacksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: response = { success: false, clientPacks: [] },
    isLoading,
    error: queryError,
  } = useGetClientPacksQuery();
  const {
    data: usersData = { success: false, users: [] },
    isLoading: usersLoading,
    error: usersError,
  } = useGetUserQuery();
  const {
    data: packsData = { success: false, packs: [] },
    isLoading: packsLoading,
    error: packsError,
  } = useGetPacksQuery();
  const [createClientPack] = useCreateClientPackMutation();
  const [updateClientPack] = useUpdateClientPackMutation();
  const [deleteClientPack] = useDeleteClientPackMutation();
  const [error, setError] = useState(null);
  const { state } = useSidebar();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const { mongoUser } = useAuth();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    client: "",
    pack: "",
    packPrice: 0,
    finalPrice: 0,
    expirationDate: "",
    remainingSessions: 0,
    purchaseState: "pending",
  });

  // Add state for clients and packs lists
  const [clients, setClients] = useState([]);
  const [packs, setPacks] = useState([]);

  const [clientsCache, setClientsCache] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (usersData?.success && usersData?.users?.length > 0) {
      const clientsWithFullName = usersData.users
        .filter((user) => user?.role?.toLowerCase() === "client")
        .map((client) => ({
          ...client,
          fullName:
            `${client?.firstName || ""} ${client?.lastName || ""}`.trim() ||
            "Unknown Client",
        }));
      setClients(clientsWithFullName);
    } else {
      console.log("No users data available:", usersData);
    }
  }, [usersData]);

  useEffect(() => {
    if (packsData?.success && packsData?.packs?.length > 0) {
      setPacks(packsData.packs);
    }
  }, [packsData]);

  const getPendingCount = () => {
    return (
      response?.clientPacks?.filter((pack) => pack?.purchaseState === "pending")
        .length || 0
    );
  };

  const getCompletedCount = () => {
    return (
      response?.clientPacks?.filter(
        (pack) => pack?.purchaseState === "completed"
      ).length || 0
    );
  };

  const getPackDisplayInfo = (pack) => {
    if (!pack) return "N/A";

    // Handle both populated and unpopulated pack objects
    if (typeof pack === "object") {
      const category = pack.category?.[locale] || "N/A";
      const sessionCount = pack.sessions?.[0]?.sessionCount || 0;
      return `${category} - ${sessionCount} sessions`;
    }

    // If we just have the ID, return a simpler display
    return `Pack ID: ${pack}`;
  };

  const handleAddNewPack = async (e) => {
    e.preventDefault();
    try {
      if (!formData.client || !formData.pack) {
        throw new Error("Client and Package are required");
      }

      const packData = {
        client: formData.client,
        pack: formData.pack,
        packPrice: formData.packPrice || 0,
        finalPrice: formData.finalPrice || 0,
        remainingSessions: formData.remainingSessions || 0,
        purchaseState: formData.purchaseState || "pending",
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate).toISOString()
          : new Date().toISOString(),
        purchaseDate: new Date().toISOString(),
      };

      const result = await createClientPack(packData).unwrap();

      if (!result?.success) {
        throw new Error(result?.message || "Failed to add pack");
      }

      setShowAddForm(false);
      resetForm();
      toast.success("Pack added successfully");
    } catch (err) {
      console.error("Error adding new pack:", err);
      setError(err?.message || "Failed to add pack");
      toast.error(err?.message || "Failed to add pack");
    }
  };

  const handleUpdatePack = async (e) => {
    e.preventDefault();
    try {
      if (!selectedPack?._id) {
        throw new Error("No pack selected for update");
      }

      const packData = {
        ...formData,
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate).toISOString()
          : new Date().toISOString(),
      };

      const result = await updateClientPack({
        id: selectedPack._id,
        ...packData,
      }).unwrap();

      if (!result?.success) {
        throw new Error(result?.message || "Failed to update pack");
      }

      setShowEditForm(false);
      setSelectedPack(null);
      resetForm();
      toast.success("Pack updated successfully");
    } catch (err) {
      setError(err?.message || "Failed to update pack");
      toast.error(err?.message || "Failed to update pack");
    }
  };

  const handleDeletePack = async () => {
    try {
      if (!selectedPack?._id) {
        throw new Error("No pack selected for deletion");
      }

      const result = await deleteClientPack(selectedPack._id).unwrap();

      if (!result?.success) {
        throw new Error(result?.message || "Failed to delete pack");
      }

      setShowDeleteDialog(false);
      setSelectedPack(null);
      toast.success("Pack deleted successfully");
    } catch (err) {
      setError(err?.message || "Failed to delete pack");
      toast.error(err?.message || "Failed to delete pack");
    }
  };

  const resetForm = () => {
    setFormData({
      client: "",
      pack: "",
      packPrice: 0,
      finalPrice: 0,
      expirationDate: "",
      remainingSessions: 0,
      purchaseState: "pending",
    });
  };

  // Optimize the filtered data calculation
  const filteredData = useMemo(() => {
    return response.clientPacks.filter((pack) => {
      const searchFields = [
        pack.clientName?.toLowerCase() || "",
        getPackDisplayInfo(pack.pack)?.toLowerCase() || "",
        String(pack.packPrice).toLowerCase(),
        String(pack.finalPrice || pack.packPrice).toLowerCase(),
        pack.purchaseState?.toLowerCase() || "",
      ];
      const query = searchQuery.toLowerCase();
      return searchFields.some((field) => field.includes(query));
    });
  }, [response.clientPacks, searchQuery]);

  // Synchronous helper to get client name by ID
  const getClientNameById = (clientId) => {
    const client = clients.find((c) => c._id === clientId);
    return client ? client.fullName : "N/A";
  };

  if (queryError || error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{queryError?.message || error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 w-full">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Client Packs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6 w-full min-w-0">
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-white mt-2">
                  Total Active Packages
                </CardTitle>
                <Package className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {response.clientPacks.length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">
                  Pending Packages
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {getPendingCount()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 w-full min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white mt-2">
                  Completed Packages
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-[#B4E90E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {getCompletedCount()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t border-white/10 my-6"></div>

          <div className="flex flex-col sm:flex-row items-end justify-end gap-2 sm:gap-3 m-3 w-full">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Search client packs..."
                className="w-full sm:w-[200px] pl-8 bg-gray-300 text-black placeholder:text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="bg-[#B4E90E] text-black hover:bg-[#B4E90E] cursor-pointer w-full sm:w-auto"
              onClick={() => setShowAddForm(true)}
            >
              Add New
            </Button>
          </div>

          <Card className="bg-gray-900 border-gray-800 border-0 w-full min-w-0">
            <CardHeader>
              <CardTitle className="text-white mt-2">
                Active Client Packages
              </CardTitle>
              <CardDescription className="text-white/60">
                Manage all client packages and subscriptions
              </CardDescription>
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
                  <table className="w-full min-w-full md:min-w-[700px] border-collapse text-xs sm:text-sm md:text-base">
                    <thead className="sticky top-0 bg-gray-900 border-gray-800 z-10">
                      <tr className="border-b border-white/10">
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Client
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Package
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Package Price
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          finalprice
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Sessions Left
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Status
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Purchase Date
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium text-white/60 border-r border-white/10">
                          Expiration
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-sm font-medium text-white/60">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td
                            colSpan="9"
                            className="p-4 text-center text-white border-b border-white/10"
                          >
                            No client packs found
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((pack) => (
                          <tr
                            key={pack._id}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium text-white border-r border-white/10">
                              {getClientNameById(pack.client)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {getPackDisplayInfo(pack.pack)}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              ${pack.packPrice}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              ${pack.finalPrice || pack.packPrice}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {pack.remainingSessions}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  pack.purchaseState === "completed"
                                    ? "bg-green-500/20 text-green-500"
                                    : pack.purchaseState === "pending"
                                      ? "bg-yellow-500/20 text-yellow-500"
                                      : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                {pack.purchaseState}
                              </span>
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {new Date(pack.purchaseDate).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-white border-r border-white/10">
                              {new Date(
                                pack.expirationDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4 text-white" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-[160px] bg-[#1F1F1F] border-white/10"
                                >
                                  <DropdownMenuLabel className="text-white">
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="text-white"
                                    onClick={() => {
                                      const packId =
                                        typeof pack.pack === "object"
                                          ? pack.pack._id
                                          : pack.pack;
                                      setSelectedPack(pack);
                                      setFormData({
                                        client: pack.client,
                                        pack: packId,
                                        packPrice: pack.packPrice,
                                        finalPrice:
                                          pack.finalPrice || pack.packPrice,
                                        expirationDate: new Date(
                                          pack.expirationDate
                                        )
                                          .toISOString()
                                          .split("T")[0],
                                        remainingSessions:
                                          pack.remainingSessions,
                                        purchaseState: pack.purchaseState,
                                      });
                                      setShowEditForm(true);
                                    }}
                                  >
                                    Edit package
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => {
                                      setSelectedPack(pack);
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    Delete package
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
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add New Client Package</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new package subscription for a client
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleAddNewPack} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.client}
                    onValueChange={(value) =>
                      setFormData({ ...formData, client: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No clients available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pack">Package</Label>
                  <Select
                    value={formData.pack}
                    onValueChange={(value) => {
                      const selectedPack = packs.find((p) => p._id === value);
                      if (selectedPack) {
                        const firstSession = selectedPack.sessions[0] || {};
                        setFormData({
                          ...formData,
                          pack: value,
                          packPrice: firstSession.price || 0,
                          finalPrice: firstSession.price || 0,
                          remainingSessions: firstSession.sessionCount || 0,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      {packs.map((pack) => (
                        <SelectItem key={pack._id} value={pack._id}>
                          {`${pack.category?.[locale]} - ${pack.sessions[0]?.sessionCount || 0} sessions`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="packPrice">Package Price</Label>
                    <Input
                      id="packPrice"
                      type="number"
                      value={formData.packPrice}
                      onChange={(e) => {
                        const newPackPrice = parseFloat(e.target.value);
                        setFormData({
                          ...formData,
                          packPrice: newPackPrice,
                          finalPrice: newPackPrice,
                        });
                      }}
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      min="0"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="finalPrice">Total Price</Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      value={formData.finalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          finalPrice: parseFloat(e.target.value),
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="remainingSessions">
                      Number of Sessions
                    </Label>
                    <Input
                      id="remainingSessions"
                      type="number"
                      value={formData.remainingSessions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remainingSessions: parseInt(e.target.value),
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={
                      formData.expirationDate
                        ? new Date(formData.expirationDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchaseState">Status</Label>
                  <Select
                    value={formData.purchaseState}
                    onValueChange={(value) =>
                      setFormData({ ...formData, purchaseState: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4 border-t border-white/10 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="text-white hover:text-[#B4E90E] transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
                  onClick={handleAddNewPack}
                >
                  Add Package
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Client Package</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the package subscription details
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(90vh-140px)]">
            <form onSubmit={handleUpdatePack} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="packPrice">Package Price</Label>
                    <Input
                      id="packPrice"
                      type="number"
                      value={formData.packPrice}
                      onChange={(e) => {
                        const newPackPrice = parseFloat(e.target.value);
                        setFormData({
                          ...formData,
                          packPrice: newPackPrice,
                          finalPrice: newPackPrice,
                        });
                      }}
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="finalPrice">Total Price</Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      value={formData.finalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          finalPrice: parseFloat(e.target.value),
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="remainingSessions">
                      Remaining Sessions
                    </Label>
                    <Input
                      id="remainingSessions"
                      type="number"
                      value={formData.remainingSessions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remainingSessions: parseInt(e.target.value),
                        })
                      }
                      className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={
                      formData.expirationDate
                        ? new Date(formData.expirationDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchaseState">Status</Label>
                  <Select
                    value={formData.purchaseState}
                    onValueChange={(value) =>
                      setFormData({ ...formData, purchaseState: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-white/10 focus:ring-[#B4E90E] focus:border-[#B4E90E]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4 border-t border-white/10 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowEditForm(false)}
                  className="text-white hover:text-[#B4E90E] transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#B4E90E] text-black hover:bg-[#A3D80D] transition-colors"
                  onClick={handleUpdatePack}
                >
                  Update Package
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 text-white w-full max-w-xs sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this package? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="text-white hover:text-[#B4E90E] transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white transition-colors"
              onClick={handleDeletePack}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
