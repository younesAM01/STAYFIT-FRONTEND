"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ShoppingCart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { useTranslations, useLocale } from "next-intl";
import { useGetClientPackByClientIdQuery } from "@/redux/services/clientpack.service";
import { useGetSessionsByCoachIdQuery } from "@/redux/services/session.service";

export default function BookingCalendar({ coachId, onSelect }) {
  const { mongoUser } = useAuth();
  const {
    data: clientPack,
    isLoading: clientPackLoading,
    isSuccess: clientPackSuccess,
    refetch: refetchClientPack,
  } = useGetClientPackByClientIdQuery(mongoUser?._id, {
    skip: !mongoUser?._id,
  });
  const {
    data: sessionData,
    isLoading: coachSessionsLoading,
    isSuccess: coachSessionsSuccess,
    refetch: refetchCoachSessions,
  } = useGetSessionsByCoachIdQuery(coachId, {
    skip: !coachId,
  });
  const locale = useLocale();

  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getWeekStartDate(today)
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [coachSessions, setCoachSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberships, setMemberships] = useState([]);
  const [hasValidMembership, setHasValidMembership] = useState(false);
  const [sessionLocation, setSessionLocation] = useState("");
  const [locationError, setLocationError] = useState(""); // New state for location error message
  const t = useTranslations("BookingCalendar");
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const weekDays = getWeekDays(currentWeekStart);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  const availableMonths = Array.from(
    { length: 12 - currentMonthIndex },
    (_, i) => ({
      index: currentMonthIndex + i,
      name: monthNames[currentMonthIndex + i].substring(0, 3),
      year: currentYear,
    })
  );
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  console.log(coachSessions);

  useEffect(() => {
    if (coachId && hasValidMembership && sessionData) {
      setCoachSessions(sessionData.sessions);
    }
  }, [coachId, hasValidMembership, sessionData]);

  useEffect(() => {
    if (hasValidMembership) {
      generateAvailableSlots(currentWeekStart, coachSessions);
    }
  }, [currentWeekStart, coachSessions, hasValidMembership]);

  useEffect(() => {
    if (clientPackSuccess && clientPack) {
      try {
        const currentDate = new Date();
        const validMemberships = clientPack.clientPack.filter(
          (pack) =>
            pack.purchaseState === "completed" &&
            new Date(pack.expirationDate) > currentDate &&
            pack.remainingSessions > 0 &&
            pack.isActive === true
        );
        setMemberships(validMemberships);
        setHasValidMembership(validMemberships.length > 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking client membership:", error);
        setIsLoading(false);
        setHasValidMembership(false);
      }
    }
  }, [clientPackSuccess, clientPack]);

  // Create a wrapped refresh function to pass up to parent
  // const refreshSessions = () => {
  //   if (coachId) {
  //     fetchCoachSessions(coachId);
  //   }
  // };

  const generateAvailableSlots = (startDate, sessions) => {
    const dummyData = {};
    weekDays.forEach((day) => {
      const dayStr = formatDateKey(day.date);
      dummyData[dayStr] = {};
      hours.forEach((hour) => {
        dummyData[dayStr][hour] = true;
      });
    });

    if (sessions && sessions.length > 0) {
      sessions.forEach((session) => {
        // Skip cancelled sessions - these slots should remain available
        if (session.status === "cancelled") {
          return;
        }

        const sessionDate = new Date(session.sessionDate);
        const sessionTimeStr = session.sessionTime;

        // Extract hour properly from time formats like "2PM" or "14:00"
        let sessionHour;
        if (sessionTimeStr.includes(":")) {
          sessionHour = parseInt(sessionTimeStr.split(":")[0], 10);
        } else {
          // Handle formats like "2PM" or "2AM"
          const timeMatch = sessionTimeStr.match(/(\d+)([AP]M)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const isPM = timeMatch[2].toUpperCase() === "PM";

            // Convert to 24-hour format
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;

            sessionHour = hours;
          } else {
            sessionHour = parseInt(sessionTimeStr, 10);
          }
        }

        const dateKey = formatDateKey(sessionDate);
        if (
          dummyData[dateKey] &&
          dummyData[dateKey][sessionHour] !== undefined
        ) {
          dummyData[dateKey][sessionHour] = false;
        }
      });
    }

    const markSpecialHoursAsUnavailable = (dayStr) => {
      if (!dummyData[dayStr][6] && !dummyData[dayStr][8]) {
        dummyData[dayStr][6] = false;
        dummyData[dayStr][8] = false;
      }
    };

    weekDays.forEach((day) => {
      const dayStr = formatDateKey(day.date);
      markSpecialHoursAsUnavailable(dayStr);
    });

    setAvailableSlots(dummyData);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
    setSelectedSlot(null);
  };

  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    setCurrentWeekStart(previousWeek);
    setSelectedSlot(null);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
    setSelectedSlot(null);
  };

  const goToMonth = (month, year = currentYear) => {
    const targetDate = new Date(year, month, 1);
    setCurrentWeekStart(getWeekStartDate(targetDate));
    setSelectedSlot(null);
  };

  const handleSlotSelect = (day, hour) => {
    const dateKey = formatDateKey(day.date);
    if (availableSlots[dateKey] && availableSlots[dateKey][hour]) {
      const formattedTime = formatHour(hour);
      setSelectedSlot({
        date: day.date,
        hour: hour,
        formattedTime: formattedTime,
      });
      setSessionLocation("");
      setLocationError(""); // Reset error message when a new slot is selected
    }
  };

  const confirmBooking = () => {
    if (!selectedSlot || !sessionLocation) {
      setLocationError(t("locationRequired")); // Set error message instead of alert
      return;
    }

    // Pass the refreshSessions function to the parent component
    onSelect(
      selectedSlot.date,
      selectedSlot.formattedTime,
      sessionLocation,
      refetchCoachSessions
    );
  };

  const currentMonthDisplay = () => {
    const date = new Date(currentWeekStart);
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekStartDate = getWeekStartDate(now);
    return currentWeekStartDate.getTime() === currentWeekStart.getTime();
  };

  const isSlotAvailableForBooking = (slotDate, slotHour) => {
    const now = new Date();
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(slotHour, 0, 0, 0);
    const bookingDeadline = new Date(slotDateTime);
    bookingDeadline.setHours(slotHour - 1, 0, 0, 0);
    return now < bookingDeadline;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[#0d111a] rounded-lg border border-[#2a3142] p-8 flex justify-center items-center">
        <div className="text-gray-400">Loading booking calendar...</div>
      </div>
    );
  }

  if (!hasValidMembership) {
    return (
      <div className="w-full bg-[#0d111a] rounded-lg border border-[#2a3142] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="p-4 bg-[#161c2a] rounded-full h-24 w-24 flex items-center justify-center">
            <Calendar size={32} className="text-[#B4E90E]" />
          </div>

          <div className="text-center">
            <h3 className="text-xl text-white sm:text-2xl font-bold mb-4">
              {t("membershipRequired")}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {t("membershipRequiredMessage")}
            </p>

            <div className="flex justify-center">
              <Button
                className="bg-[#B4E90E] hover:bg-[#A0D50C] text-black font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => (window.location.href = `/${locale}`)}
              >
                <ShoppingCart size={20} />
                {t("buyAPackage")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0d111a] rounded-lg border border-[#2a3142] p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          {currentMonthDisplay()}
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={goToPreviousWeek}
            variant="outline"
            size="icon"
            className="border-[#2a3142] hover:bg-[#2a3142]"
            title="Previous Week"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          {!isCurrentWeek() && (
            <Button
              onClick={goToCurrentWeek}
              variant="outline"
              className="border-[#2a3142] hover:bg-[#2a3142]"
            >
              {t("currentWeek")}
            </Button>
          )}

          <Button
            onClick={goToNextWeek}
            variant="outline"
            size="icon"
            className="border-[#2a3142] hover:bg-[#2a3142]"
            title="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 text-center text-white">
        <span className="text-sm font-medium">
          {weekDays[0].date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          -
          {weekDays[6].date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="flex justify-center mb-6 flex-wrap gap-2">
        {availableMonths.map((month) => {
          // Calculate the end of the current week
          const weekEndDate = new Date(currentWeekStart);
          weekEndDate.setDate(currentWeekStart.getDate() + 6);

          // Check if this month is visible in the current week view
          const isMonthVisible =
            currentWeekStart.getMonth() === month.index ||
            weekEndDate.getMonth() === month.index;

          return (
            <Button
              key={month.index}
              onClick={() => goToMonth(month.index, month.year)}
              variant="ghost"
              size="sm"
              className={`text-gray-400 hover:text-white hover:bg-[#2a3142] ${
                isMonthVisible ? "bg-[#2a3142] text-white" : ""
              }`}
            >
              {month.name}
            </Button>
          );
        })}
      </div>

      <div className="w-full overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="w-16"></th>
              {weekDays.map((day) => (
                <th
                  key={day.dateStr}
                  className="px-2 py-3 text-center font-medium text-gray-300"
                >
                  <div className="text-sm text-gray-400">{day.name}</div>
                  <div className="text-lg">{day.date.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {hours.map((hour) => (
              <tr key={hour} className="border-t border-[#2a3142]">
                <td className="py-3 px-2 text-right text-sm text-gray-400">
                  {formatHour(hour)}
                </td>

                {weekDays.map((day) => {
                  const dateKey = formatDateKey(day.date);
                  const isAvailable =
                    availableSlots[dateKey] && availableSlots[dateKey][hour];
                  const isSelected =
                    selectedSlot &&
                    selectedSlot.date.getDate() === day.date.getDate() &&
                    selectedSlot.date.getMonth() === day.date.getMonth() &&
                    selectedSlot.hour === hour;

                  const todayMidnight = new Date();
                  todayMidnight.setHours(0, 0, 0, 0);
                  const isPastDate = day.date < todayMidnight;
                  const isToday =
                    day.date.toDateString() === new Date().toDateString();
                  const isPastTime = isToday && hour < new Date().getHours();
                  const isBookingWindowClosed =
                    isToday && !isSlotAvailableForBooking(day.date, hour);
                  const isPast =
                    isPastDate || isPastTime || isBookingWindowClosed;

                  const sessionOnSlot = coachSessions.find((session) => {
                    // Skip cancelled sessions
                    if (session.status === "cancelled") {
                      return false;
                    }

                    const sessionDate = new Date(session.sessionDate);
                    const sessionDay = sessionDate.getDate();
                    const sessionMonth = sessionDate.getMonth();
                    const sessionYear = sessionDate.getFullYear();

                    // Extract hour from time formats like "2PM" or "14:00"
                    let sessionHour;
                    if (session.sessionTime.includes(":")) {
                      sessionHour = parseInt(
                        session.sessionTime.split(":")[0],
                        10
                      );
                    } else {
                      // Handle formats like "2PM" or "2AM"
                      const timeMatch =
                        session.sessionTime.match(/(\d+)([AP]M)/i);
                      if (timeMatch) {
                        let hours = parseInt(timeMatch[1], 10);
                        const isPM = timeMatch[2].toUpperCase() === "PM";

                        // Convert to 24-hour format
                        if (isPM && hours < 12) hours += 12;
                        if (!isPM && hours === 12) hours = 0;

                        sessionHour = hours;
                      } else {
                        sessionHour = parseInt(session.sessionTime, 10);
                      }
                    }

                    return (
                      sessionDay === day.date.getDate() &&
                      sessionMonth === day.date.getMonth() &&
                      sessionYear === day.date.getFullYear() &&
                      sessionHour === hour
                    );
                  });

                  return (
                    <td
                      key={`${dateKey}-${hour}`}
                      className="border border-[#2a3142] p-1"
                    >
                      <button
                        onClick={() => handleSlotSelect(day, hour)}
                        disabled={!isAvailable || isPast || sessionOnSlot}
                        className={`w-full h-12 rounded-md transition-colors ${
                          isSelected
                            ? "bg-[#B4E90E] text-[#0d111a]"
                            : isAvailable && !isPast && !sessionOnSlot
                              ? "bg-[#223039] hover:bg-[#2c4049] text-green-400"
                              : "bg-[#1a1e2a] text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {sessionOnSlot
                          ? t("booked")
                          : isAvailable && !isPast
                            ? t("available")
                            : t("unavailable")}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSlot && (
        <div className="mt-6 p-4 border rounded-lg border-[#2a3142]">
          <h3 className="text-lg font-medium mb-2 text-white">
            {t("selectedTime")}
          </h3>
          <p className="mb-4 text-gray-300">
            {selectedSlot.date.toDateString()} at {selectedSlot.formattedTime}
          </p>
          <input
            type="text"
            placeholder={t("sessionLocation")}
            value={sessionLocation}
            onChange={(e) => {
              setSessionLocation(e.target.value);
              setLocationError(""); // Clear error message on input change
            }}
            className="w-full p-2 mb-4 border text-white border-gray-300 rounded"
          />
          {locationError && <p className="text-red-500">{locationError}</p>}{" "}
          {/* Show error message */}
          <Button
            onClick={confirmBooking}
            className="w-full bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c]"
          >
            {t("continueToConfirmation")}
          </Button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">{t("note")}</div>
    </div>
  );
}

function getWeekStartDate(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getWeekDays(startDate) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

    return {
      name: dayNames[dayIndex],
      date: new Date(date),
      dateStr: formatDateKey(date),
    };
  });
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatHour(hour) {
  return `${hour % 12 || 12}${hour < 12 ? "AM" : "PM"}`;
}
