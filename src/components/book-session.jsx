"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import CoachSelection from "./coach-selection"
import BookingCalendar from "./booking-calendar"

export default function BookingSection({clientId , setActiveTab , clientPack , refreshClientPack}) {
  const [step, setStep] = useState("coach")
  const [selectedCoachId, setSelectedCoachId] = useState(null)
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [sessionLocation, setSessionLocation] = useState('') // New state for session location
  const [coaches, setCoaches] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshSessionsFunction, setRefreshSessionsFunction] = useState(null)
  
  useEffect(() => {
    // Fetch coaches to have access to the coach data
    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coach');
        if (!response.ok) {
          throw new Error('Failed to fetch coaches');
        }
        const data = await response.json();
        setCoaches(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCoaches();
  }, []);

  // Find coach by ID whenever selectedCoachId changes
  useEffect(() => {
    if (selectedCoachId && coaches.length > 0) {
      const coach = coaches.find(coach => coach._id === selectedCoachId);
      setSelectedCoach(coach);
    }
  }, [selectedCoachId, coaches]);

  const handleCoachSelect = (coachId) => {
    setSelectedCoachId(coachId)
    setStep("calendar")
  }

  const handleDateTimeSelect = (date, time, location, refreshSessions) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setSessionLocation(location) // Set the session location
    setRefreshSessionsFunction(() => refreshSessions) // Store the refresh function
    setStep("confirmation")
  }

  const handleBack = () => {
    if (step === "calendar") setStep("coach")
    if (step === "confirmation") setStep("calendar")
  }

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)
      
      // Format the date for the API
      const formattedDate = selectedDate.toISOString().split('T')[0] + "T00:00:00.000Z"
      
      // Create session data object
      const sessionData = {
        client: clientId, // Using the fixed client ID from your example
        coach: selectedCoachId,
        pack: clientPack.pack._id, // Using the fixed pack ID from your example
        sessionDate: formattedDate,
        sessionTime: selectedTime,
        location: sessionLocation,
        status: "scheduled"
      }
      
      // Make API call to create new session
      const response = await fetch('http://localhost:3000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create session')
      }
      
      const result = await response.json()
      
      const updatePackResponse = await fetch(`http://localhost:3000/api/client-pack?id=${clientPack._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remainingSessions: clientPack.remainingSessions - 1
        }),
      })
      if (!updatePackResponse.ok) {
        throw new Error('Failed to update remaining sessions')
      }
      // Refresh client pack data after successful update
      if (refreshClientPack) {
        await refreshClientPack();
      }
      
      // Call the refresh sessions function if it exists
      if (refreshSessionsFunction) {
        refreshSessionsFunction();
      }
      
      alert("Session booked successfully!")
      
      // Reset the form
      setActiveTab("membership")
      setSelectedCoachId(null)
      setSelectedCoach(null)
      setSelectedDate(null)
      setSelectedTime(null)
      setSessionLocation('')
      setRefreshSessionsFunction(null)
    } catch (error) {
      console.error("Error creating session:", error)
      alert("Failed to book session. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full bg-[#161c2c] border-[#2a3142]">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Book a Session</CardTitle>
        <CardDescription className="text-gray-400">
          Select a coach and schedule a time that works for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#0d111a]">
            <TabsTrigger
              value="coach"
              disabled={step !== "coach"}
              className="data-[state=active]:bg-[#B4E90E] data-[state=active]:text-[#0d111a]"
            >
              Choose Coach
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              disabled={step !== "calendar"}
              className="data-[state=active]:bg-[#B4E90E] data-[state=active]:text-[#0d111a]"
            >
              Select Time
            </TabsTrigger>
            <TabsTrigger
              value="confirmation"
              disabled={step !== "confirmation"}
              className="data-[state=active]:bg-[#B4E90E] data-[state=active]:text-[#0d111a]"
            >
              Confirm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coach" className="mt-6">
            <CoachSelection onSelect={handleCoachSelect} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="mb-4">
              <Button variant="outline" size="sm" onClick={handleBack} className="border-[#2a3142] hover:bg-[#2a3142]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Coaches
              </Button>
            </div>
            <BookingCalendar coachId={selectedCoachId} onSelect={handleDateTimeSelect} />
          </TabsContent>

          <TabsContent value="confirmation" className="mt-6">
            <div className="mb-4">
              <Button variant="outline" size="sm" onClick={handleBack} className="border-[#2a3142] hover:bg-[#2a3142]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Calendar
              </Button>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-[#2a3142] p-4 bg-[#0d111a]">
                <h3 className="font-medium mb-2 text-white">Booking Summary</h3>
                <div className="space-y-2 text-white">
                  <p className="text-white">
                    <span className="text-gray-400">Coach:</span> {selectedCoach ? `${selectedCoach.firstName} ${selectedCoach.lastName}` : ''}
                  </p>
                  <p>
                    <span className="text-gray-400">Date:</span> {selectedDate?.toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-gray-400">Time:</span> {selectedTime}
                  </p>
                  <p>
                    <span className="text-gray-400">Location:</span> {sessionLocation}
                  </p>
                </div>
              </div>

              <Button 
                className="w-full bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c]" 
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}