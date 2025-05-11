"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useSendFreeSessionEmailMutation } from "@/redux/services/email.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ReserveSessionPage() {
  const router = useRouter();
  const [sendFreeSessionEmail, { isLoading, error , isSuccess , isError }] = useSendFreeSessionEmailMutation();
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    location: "",
    timeRange: "",
  });
  useEffect(() => {
    if (isSuccess) {
      toast.success("Your request has been sent successfully , we will contact you as soon as possible");
      router.push("/");
    }
    if (isError) {
      toast.error(error?.data?.message);
    }
  }, [isSuccess, isError, router , error]);

  const handleFormSubmission = async (e) => {
    e.preventDefault();

    // Reset all errors
    setErrors({
      name: "",
      email: "",
      phone: "",
      city: "",
      location: "",
      timeRange: "",
    });

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      location: formData.get("location"),
      date: formData.get("date"),
      timeRange: formData.get("timeRange"),
    };

    // Create a new errors object
    const newErrors = {};
    let hasErrors = false;

    // Validate each field
    if (!data.name) {
      newErrors.name = "Please enter your full name";
      hasErrors = true;
    }

    if (!data.email) {
      newErrors.email = "Please enter your email address";
      hasErrors = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        newErrors.email = "Please enter a valid email address";
        hasErrors = true;
      }
    }

    if (!data.phone) {
      newErrors.phone = "Please enter your phone number";
      hasErrors = true;
    } else {
      const phoneRegex = /^\+?[0-9\s\-()]+$/;
      if (!phoneRegex.test(data.phone)) {
        newErrors.phone = "Please enter a valid phone number";
        hasErrors = true;
      }
    }

    if (!data.city) {
      newErrors.city = "Please enter your city";
      hasErrors = true;
    }

    if (!data.location) {
      newErrors.location = "Please enter your session location";
      hasErrors = true;
    }

    if (!data.timeRange) {
      newErrors.timeRange = "Please select a time range";
      hasErrors = true;
    }

    // Update errors state if any
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    console.log("Form submission data:", data);

    try {
      const response = await sendFreeSessionEmail(data).unwrap();
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    // Here you would typically send the data to your API
    // For now we're just logging it
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl mx-auto mt-16">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
          Reserve Your Free Session
        </h1>
        <p className="text-zinc-400 text-center mb-8">
          Fill out the form below to book your complimentary fitness
          consultation
        </p>

        <Card className="border-0 bg-gray-900 text-white shadow-xl rounded-lg p-4">
          <CardHeader className="border-b border-gray-900 bg-gray-900">
            <CardTitle className="text-[#B4E90E]">
              Personal Information
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Please provide your details to reserve your free coaching session
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmission} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-zinc-300 focus-visible:ring-[#B4E90E] ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-zinc-300 focus-visible:ring-[#B4E90E] ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    required
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-zinc-300 focus-visible:ring-[#B4E90E] ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-zinc-300">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Your city"
                    required
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-zinc-300 focus-visible:ring-[#B4E90E] ${
                      errors.city ? "border-red-500" : ""
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-zinc-300">
                    Session Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter your preferred session location"
                    required
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-zinc-300 focus-visible:ring-[#B4E90E] ${
                      errors.location ? "border-red-500" : ""
                    }`}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-6">
                <h3 className="text-lg font-medium text-[#B4E90E] mb-4">
                  Session Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-zinc-300">
                      Preferred Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white",
                            !date && "text-zinc-300"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-gray-800 text-white rounded-md"
                          classNames={{
                            months:
                              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex w-full mt-2 mb-2",
                            head_cell:
                              "text-zinc-300 w-10 h-10 font-normal text-sm rounded-md mx-0.5",
                            row: "flex w-full mt-2 mb-1",
                            cell: "relative w-10 h-10 text-center text-sm p-0 rounded-md mx-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day_selected:
                              "bg-[#B4E90E] text-black hover:bg-[#a3d40c] hover:text-black focus:bg-[#B4E90E] focus:text-black w-10 h-10 mx-auto rounded-md",
                            day_today:
                              "bg-gray-700 text-white w-10 h-10 mx-auto rounded-md",
                            day: "text-white hover:bg-gray-700 focus:bg-gray-700 w-10 h-10 mx-auto p-0 mb-1 rounded-md",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="hidden"
                      name="date"
                      value={date ? format(date, "yyyy-MM-dd") : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeRange" className="text-zinc-300">
                      Preferred Time Range (4 hours)
                    </Label>
                    <Select name="timeRange">
                      <SelectTrigger
                        className={`bg-gray-800 border-gray-600 text-white focus:ring-[#B4E90E] ${
                          errors.timeRange ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue
                          placeholder="Select time range"
                          className="platext-zinc-300"
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="8-12">8:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12-16">
                          12:00 PM - 4:00 PM
                        </SelectItem>
                        <SelectItem value="16-20">4:00 PM - 8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.timeRange && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.timeRange}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#B4E90E] hover:bg-[#a3d40c] text-black font-bold py-3"
                >
                  Reserve My Free Session
                </Button>
                <p className="text-zinc-400 text-sm mt-4 text-center">
                  By submitting this form, you agree to be contacted regarding
                  your free fitness consultation
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
