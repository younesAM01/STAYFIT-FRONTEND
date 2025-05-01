"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Mail,
  MapPin,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useLocale } from "next-intl";
import { useGetSessionsByCoachIdQuery } from "@/redux/services/session.service";

const CoachCalendar = () => {
  const { mongoUser } = useAuth();
  const coachId = mongoUser?._id;
  const locale = useLocale();

  const [currentWeekStart, setCurrentWeekStart] = useState(
    getWeekStartDate(new Date())
  );
  const [hoveredSession, setHoveredSession] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [coachSessions, setCoachSessions] = useState([]);
  const { data, isSuccess, isLoading, isError, error } =
    useGetSessionsByCoachIdQuery(coachId, {
      skip: !coachId,
    });

  useEffect(() => {
    if (isSuccess && data) {
      setCoachSessions(data.sessions);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    // Set up mouse move event listener for tooltip positioning
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Modified to include hours from 8 AM to 10 PM (22:00)
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
  const weekDays = getWeekDays(currentWeekStart);

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    setCurrentWeekStart(previousWeek);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  };

  // Get the session hour from sessionTime (e.g., "8AM" -> 8, "2PM" -> 14)
  const getSessionHour = (sessionTime) => {
    const timeMatch = sessionTime.match(/(\d+)([AP]M)/);
    if (!timeMatch) return null;

    let hour = parseInt(timeMatch[1], 10);
    const meridian = timeMatch[2];

    // Convert to 24-hour format
    if (meridian === "PM" && hour < 12) {
      hour += 12;
    } else if (meridian === "AM" && hour === 12) {
      hour = 0;
    }

    return hour;
  };

  // Find sessions for a specific day and hour
  const getSessionsForTimeSlot = (day, hour) => {
    return coachSessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate);
      const sessionHour = getSessionHour(session.sessionTime);

      // Check if session date matches the day and session hour matches the hour
      return (
        sessionDate.getDate() === day.date.getDate() &&
        sessionDate.getMonth() === day.date.getMonth() &&
        sessionDate.getFullYear() === day.date.getFullYear() &&
        sessionHour === hour
      );
    });
  };

  // Get active (non-cancelled) session for a time slot if available, otherwise return cancelled one
  const getPrioritySessionForTimeSlot = (day, hour) => {
    const sessions = getSessionsForTimeSlot(day, hour);

    if (!sessions || sessions.length === 0) {
      return null;
    }

    // First look for scheduled/active sessions
    const scheduledSession = sessions.find(
      (session) => session.status === "scheduled"
    );
    if (scheduledSession) {
      return scheduledSession;
    }

    // Then look for completed sessions
    const completedSession = sessions.find(
      (session) => session.status === "completed"
    );
    if (completedSession) {
      return completedSession;
    }

    // Otherwise, return the first cancelled session or any other status
    return sessions[0];
  };

  // Format session time for display (e.g., "8AM" -> "8:00 AM")
  const formatSessionTime = (sessionTime) => {
    const timeMatch = sessionTime.match(/(\d+)([AP]M)/);
    if (!timeMatch) return sessionTime;

    const hour = timeMatch[1];
    const meridian = timeMatch[2];

    return `${hour}:00 ${meridian}`;
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    const timeMatch = startTime.match(/(\d+)([AP]M)/);
    if (!timeMatch) return null;

    let hour = parseInt(timeMatch[1], 10);
    const meridian = timeMatch[2];

    // Convert to 24-hour format
    if (meridian === "PM" && hour < 12) {
      hour += 12;
    } else if (meridian === "AM" && hour === 12) {
      hour = 0;
    }

    // Add duration
    const endDate = new Date();
    endDate.setHours(hour, 0, 0, 0);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    // Format back to 12-hour format
    let endHour = endDate.getHours();
    const endMeridian = endHour >= 12 ? "PM" : "AM";

    if (endHour > 12) {
      endHour -= 12;
    } else if (endHour === 0) {
      endHour = 12;
    }

    return `${endHour}:00 ${endMeridian}`;
  };

  const getSessionBackgroundColor = (session) => {
    if (!session) return "hover:bg-[#1a1e2a]";
    switch (session.status) {
      case "scheduled":
        return "bg-blue-400";
      case "completed":
        return "bg-green-400";
      case "cancelled":
        return "bg-[#3e2a2a]";
      default:
        return "bg-[#223039]";
    }
  };

  return (
    <div className="w-full p-2 sm:p-6 mb-28">
      <h1 className="text-xl sm:text-2xl font-bold mb-16 sm:mb-10 text-white">
        Coach Calendar
      </h1>

      <div className="w-full mx-auto bg-gray-900 border-gray-800 text-white rounded-lg shadow border ">
        <div className="flex justify-between items-center p-2 sm:p-4 border-b border-gray-700">
          <div className="flex items-center gap-1 sm:gap-2">
            <Calendar className="text-[#B4E90E] hidden sm:block" size={20} />
            <h2 className="text-lg sm:text-xl font-bold">Weekly Schedule</h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-800 text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs sm:text-sm bg-[#2a3142] text-[#B4E90E] rounded-md hover:bg-[#353e52]"
            >
              Current Week
            </button>

            <button
              onClick={goToNextWeek}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-800 text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B4E90E]"></div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-center">
              <p className="text-lg font-semibold mb-2">
                Error loading sessions
              </p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        ) : (
          // Calendar container with horizontal scroll on mobile
          <div className="w-full overflow-x-auto md:overflow-x-hidden">
            <div className="min-w-max md:w-full">
              {/* Calendar header */}
              <div className="grid grid-cols-8 border-b border-gray-700">
                <div className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500 border-r border-gray-700 sticky left-0 z-10">
                  GMT+00
                </div>

                {weekDays.map((day) => {
                  const isToday =
                    day.date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={day.dateStr}
                      className={`p-1 sm:p-3 text-center border-r border-gray-700 ${isToday ? "bg-blue-900" : ""}`}
                    >
                      <div className="text-xs sm:text-sm font-medium text-gray-400">
                        {day.name.toUpperCase()}
                      </div>
                      <div
                        className={`text-lg sm:text-2xl font-bold ${isToday ? "text-blue-300" : "text-white"}`}
                      >
                        {day.date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-8 border-b border-gray-700"
                >
                  <div className="p-1 sm:p-2 text-right text-xs text-gray-500 border-r border-gray-700 sticky left-0 z-10">
                    {formatHour(hour)}
                  </div>

                  {weekDays.map((day) => {
                    // Get session with priority for scheduled over cancelled
                    const session = getPrioritySessionForTimeSlot(day, hour);
                    // Get all sessions to show count badge if multiple sessions exist
                    const allSessionsInSlot = getSessionsForTimeSlot(day, hour);
                    const sessionCount = allSessionsInSlot.length;

                    return (
                      <div
                        key={`${day.dateStr}-${hour}`}
                        className={`border-r border-gray-700 relative ${getSessionBackgroundColor(session)}`}
                        style={{ height: "50px" }}
                      >
                        {session && (
                          <div
                            className="absolute inset-0 m-1 p-1 text-white text-xs rounded overflow-hidden cursor-pointer transition-all hover:bg-[#35505d]"
                            onMouseEnter={() =>
                              !isMobile && setHoveredSession(session)
                            }
                            onMouseLeave={() =>
                              !isMobile && setHoveredSession(null)
                            }
                            onClick={() =>
                              setHoveredSession(
                                hoveredSession === session ? null : session
                              )
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <User
                                  size={10}
                                  className="text-[#B4E90E] hidden sm:block"
                                />
                                <span className="font-bold truncate text-xs">
                                  {session.client.firstName}{" "}
                                  {session.client.lastName}
                                </span>
                              </div>
                              {sessionCount > 1 && (
                                <span className="bg-[#B4E90E] text-black text-xs px-1 rounded-full">
                                  {sessionCount}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-300 mt-1 hidden sm:flex items-center gap-1">
                              <MapPin size={8} />
                              <span className="truncate text-xs">
                                {session.location}
                              </span>
                            </div>
                            <div className="text-[#B4E90E] text-xs mt-1">
                              {formatSessionTime(session.sessionTime)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session info modal for mobile / tooltip for desktop */}
      {hoveredSession && (
        <div
          className={`
            ${
              isMobile
                ? "fixed inset-0 flex items-center justify-center bg-[#0d111a] text-white bg-opacity-50 z-50 p-4"
                : "fixed bg-[#0d111a] p-4 rounded-lg shadow-lg border border-[#2a3142] z-50 w-72 text-white"
            }
          `}
          style={
            !isMobile
              ? {
                  top: `${mousePosition.y + 10}px`,
                  left: `${mousePosition.x + 10}px`,
                  transform:
                    mousePosition.x > window.innerWidth - 300
                      ? "translateX(-100%)"
                      : "translateX(0)",
                }
              : {}
          }
          onClick={() => isMobile && setHoveredSession(null)}
        >
          <div
            className={`
              ${isMobile ? "bg-[#0d111a] p-4 rounded-lg w-full max-w-sm" : ""}
            `}
            onClick={(e) => isMobile && e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#B4E90E]" />
                <h3 className="font-bold text-lg">
                  {hoveredSession.client.firstName}{" "}
                  {hoveredSession.client.lastName}
                </h3>
              </div>
              {isMobile && (
                <button
                  onClick={() => setHoveredSession(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm">{hoveredSession.client.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar
                  size={16}
                  className="text-gray-400 mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-400">Session Time</p>
                  <p className="text-sm">
                    {new Date(hoveredSession.sessionDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                    , {formatSessionTime(hoveredSession.sessionTime)} -{" "}
                    {calculateEndTime(
                      hoveredSession.sessionTime,
                      hoveredSession.duration
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-gray-400 mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm">{hoveredSession.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Package
                  size={16}
                  className="text-gray-400 mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-400">Package</p>
                  <p className="text-sm">
                    {hoveredSession.pack?.category?.[locale]}
                  </p>
                </div>
              </div>

              {hoveredSession.client.diseases &&
                hoveredSession.client.diseases.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Health Notes</p>
                    <p className="text-sm italic text-gray-300">
                      {hoveredSession.client.diseases.join(", ")}
                    </p>
                  </div>
                )}

              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Client Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Age</p>
                    <p>{hoveredSession.client.age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Weight</p>
                    <p>{hoveredSession.client.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Height</p>
                    <p>{hoveredSession.client.height} cm</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Language</p>
                    <p>{hoveredSession.client.preferredLanguage}</p>
                  </div>
                </div>
              </div>
              {hoveredSession.status && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">Status</p>
                  <p
                    className={`text-sm font-medium ${
                      hoveredSession.status === "scheduled"
                        ? "text-blue-400"
                        : hoveredSession.status === "completed"
                          ? "text-green-400"
                          : hoveredSession.status === "cancelled"
                            ? "text-red-400"
                            : "text-gray-300"
                    }`}
                  >
                    {hoveredSession.status.charAt(0).toUpperCase() +
                      hoveredSession.status.slice(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getWeekStartDate(date) {
  const day = date.getDay();
  // Make Monday the first day (1)
  // For Monday start: if day is 0 (Sunday), set to -6, otherwise day - 1
  const diff = day === 0 ? date.getDate() - 6 : date.getDate() - day + 1;
  return new Date(date.setDate(diff));
}

function getWeekDays(startDate) {
  // Reordered to start with Monday
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    return {
      name: dayNames[i], // Use the reordered array instead of date.getDay()
      date: new Date(date),
      dateStr: formatDateKey(date),
    };
  });
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatHour(hour) {
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

export default CoachCalendar;
