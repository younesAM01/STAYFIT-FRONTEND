import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Package,
  ShoppingCart,
  User,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useGetClientPackByClientIdQuery } from "@/redux/services/clientpack.service";
import {
  useCancelSessionMutation,
  useCompleteSessionMutation,
  useGetSessionsByClientIdQuery,
} from "@/redux/services/session.service";


const Membership = ({ setActiveTab }) => {
  const { mongoUser } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [finishedSessions, setFinishedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveMemberships, setHasActiveMemberships] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const t = useTranslations("MembershipPage");
  const locale = useLocale();
  const {
    data: clientPack,
    isLoading: clientPackLoading,
    refetch: refetchClientPack,
  } = useGetClientPackByClientIdQuery(mongoUser?._id, {
    skip: !mongoUser?._id,
  });
  const {
    data: sessions,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useGetSessionsByClientIdQuery(mongoUser?._id, {
    skip: !mongoUser?._id,
  });
  const [cancelSession, { isLoading: cancelLoading }] =
    useCancelSessionMutation();
  const [completeSession, { isLoading: completeLoading }] =
    useCompleteSessionMutation();

  useEffect(() => {
    if (sessions?.sessions) {
      const completedSessions = sessions.sessions.filter(
        (session) => session.status === "completed"
      );
      setFinishedSessions(completedSessions);
    }
  }, [sessions]);
  useEffect(() => {
    if (sessions?.sessions) {
      const scheduledSessions = sessions.sessions.filter(
        (session) => session.status === "scheduled"
      );
      setUpcomingSessions(scheduledSessions);
    }
  }, [sessions, sessionsLoading]);
  useEffect(() => {
    if (!clientPackLoading) {
      setLoading(false);

      if (clientPack) {
        setHasActiveMemberships(clientPack?.clientPack?.length > 0);
        setMemberships(clientPack?.clientPack);
      }
    }
  }, [clientPack, clientPackLoading]);

  
  // Helper function to normalize time string for better parsing
  const normalizeTimeString = (timeStr) => {
    if (!timeStr) return null;

    // Convert to uppercase for consistency
    timeStr = timeStr.toUpperCase().trim();

    // Handle cases where time is just a number (hour only)
    if (/^\d+$/.test(timeStr)) {
      return `${timeStr}:00`;
    }

    // If it already has AM/PM designation
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      // Make sure there's a space before AM/PM
      return timeStr.replace(/(AM|PM)$/i, " $1").replace(/\s+/g, " ");
    }

    // Assume 24-hour format if no AM/PM
    return timeStr;
  };

  // Helper function to format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return "";

    try {
      // Handle simple hour-only format
      if (/^\d+$/.test(timeStr)) {
        const hour = parseInt(timeStr, 10);
        if (isNaN(hour)) return timeStr;

        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;

        return `${hour12}:00 ${period}`;
      }

      // Normalize the time first
      const normalizedTime = normalizeTimeString(timeStr);

      // If it already has AM/PM, just ensure proper formatting
      if (normalizedTime.includes("AM") || normalizedTime.includes("PM")) {
        // Already in 12-hour format
        return normalizedTime;
      }

      // Convert 24-hour to 12-hour format for display
      const [hourStr, minuteStr] = normalizedTime.split(":");
      const hour = parseInt(hourStr, 10);

      if (isNaN(hour)) return timeStr; // Return original if parsing fails

      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM

      return `${hour12}:${minuteStr || "00"} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeStr; // Return original on error
    }
  };

  // Function to check if session is at least 12 hours from now
  const isSessionCancellable = (sessionDate, sessionTime) => {
    try {
      if (!sessionDate || !sessionTime) return false;

      // Normalize time string for better parsing
      const normalizedTime = normalizeTimeString(sessionTime);
      if (!normalizedTime) return false;

      // Create a date object by combining date and time
      const sessionDateTime = new Date(sessionDate);

      // Handle different time formats (both 12h and 24h)
      let hours, minutes;

      if (normalizedTime.includes("AM") || normalizedTime.includes("PM")) {
        // Handle 12-hour format (e.g., "9:00 AM")
        const parts = normalizedTime.split(" ");
        const timePart = parts[0];
        const period = parts.length > 1 ? parts[1] : null;

        if (!timePart || !period) {
          console.log(
            `Invalid time format: ${normalizedTime} from original ${sessionTime}`
          );
          return false;
        }

        const timePieces = timePart.split(":");

        // Handle hour-only formats
        if (timePieces.length === 1) {
          hours = parseInt(timePieces[0], 10);
          minutes = 0;
        } else if (timePieces.length >= 2) {
          hours = parseInt(timePieces[0], 10);
          minutes = parseInt(timePieces[1], 10);
        } else {
          console.log(
            `Invalid time part format: ${timePart} from ${sessionTime}`
          );
          return false;
        }

        if (isNaN(hours) || isNaN(minutes)) {
          console.log(
            `Invalid hours or minutes: hours=${hours}, minutes=${minutes} from ${sessionTime}`
          );
          return false;
        }

        // Convert to 24-hour format
        if (period === "PM" && hours < 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }
      } else {
        // Handle 24-hour format (e.g., "09:00" or "14:30")
        const parts = normalizedTime.split(":");

        if (parts.length === 1) {
          hours = parseInt(parts[0], 10);
          minutes = 0;
        } else if (parts.length >= 2) {
          hours = parseInt(parts[0], 10);
          minutes = parseInt(parts[1], 10);
        } else {
          console.log(
            `Invalid 24-hour time format: ${normalizedTime} from ${sessionTime}`
          );
          return false;
        }

        if (isNaN(hours) || isNaN(minutes)) {
          console.log(
            `Invalid hours or minutes in 24-hour format: hours=${hours}, minutes=${minutes} from ${sessionTime}`
          );
          return false;
        }
      }

      // Set the time part of the date
      sessionDateTime.setHours(hours, minutes, 0, 0);

      // Get current time
      const now = new Date();

      // Calculate time difference in hours
      const timeDifferenceInHours = (sessionDateTime - now) / (1000 * 60 * 60);

      // Session can be cancelled if it's at least 12 hours away
      return timeDifferenceInHours >= 12;
    } catch (error) {
      console.error(
        "Error calculating cancellation eligibility:",
        error,
        "for time:",
        sessionTime
      );
      return false; // If there's an error, don't allow cancellation to be safe
    }
  };

  const handleCancelButtonClick = (session) => {
    try {
      // Check if session has required data
      if (!session.sessionDate || !session.sessionTime) {
       

        setErrorMessage(
          t(
            "invalidSessionData",
            "Session data is incomplete. Please contact support."
          )
        );
        setShowErrorModal(true);
        return;
      }

      // Check if session can be cancelled (at least 12 hours before)
      if (!isSessionCancellable(session.sessionDate, session.sessionTime)) {
        const sessionDateTime = new Date(session.sessionDate);

        // Parse time more carefully
        let hours = 0,
          minutes = 0;
        const timeStr = session.sessionTime;

        // Handle hour-only format
        if (/^\d+$/.test(timeStr)) {
          hours = parseInt(timeStr, 10);
          minutes = 0;
        }
        // Handle hour:minute format
        else if (timeStr.includes(":")) {
          const [hourStr, minuteStr] = timeStr.split(":");
          hours = parseInt(hourStr, 10);
          minutes = parseInt(minuteStr, 10);
        }
        // Handle hour AM/PM format
        else if (timeStr.includes("AM") || timeStr.includes("PM")) {
          const parts = timeStr.split(/\s+/);
          const timePart = parts[0];
          const period = parts[1];

          if (timePart) {
            hours = parseInt(timePart, 10);

            if (period && period.toUpperCase() === "PM" && hours < 12) {
              hours += 12;
            } else if (
              period &&
              period.toUpperCase() === "AM" &&
              hours === 12
            ) {
              hours = 0;
            }
          }
        }

        if (!isNaN(hours) && !isNaN(minutes)) {
          sessionDateTime.setHours(hours, minutes, 0, 0);
        }

        const now = new Date();
        const hoursUntilSession = Math.max(
          0,
          (sessionDateTime - now) / (1000 * 60 * 60)
        ).toFixed(1);

        console.log(
          `Session cancellation rejected: Only ${hoursUntilSession} hours until session starts`
        );

        setErrorMessage(
          t(
            "cannotCancelSession12Hours",
            `Sessions must be cancelled at least 12 hours in advance. This session is in ${hoursUntilSession} hours, which is too close to the start time.`
          )
        );
        setShowErrorModal(true);
        return;
      }

      // If cancellable, show confirmation modal
      setSessionToCancel(session);
      setCancelModalOpen(true);
    } catch (error) {
      console.error("Error in handleCancelButtonClick:", error);
      setErrorMessage(
        t(
          "generalError",
          "An error occurred while processing your request. Please try again."
        )
      );
      setShowErrorModal(true);
    }
  };

  const handleCancelSession = async () => {
    console.log("sessionToCancel", sessionToCancel);
    await cancelSession(sessionToCancel._id).unwrap();
    toast.success("Session cancelled successfully");
    refetchClientPack();
    refetchSessions();
    setCancelModalOpen(false);
    setSessionToCancel(null);
    setShowErrorModal(false);
    setErrorMessage(null);
  };

  const handleCompleteSession = async (session) => {
    try {
      console.log("sessionToComplete", session);

      // Find the client pack associated with this session
      const packId = session.clientPack;
      if (!packId) {
        console.error("No client pack ID found in session");
        toast.error(
          "Session could not be completed. Missing client pack information."
        );
        return;
      }

      // Complete the session first
      await completeSession(session._id).unwrap();

      // Find the client pack from our state
      const clientPackToUpdate = memberships.find(
        (pack) => pack._id === packId
      );
      if (!clientPackToUpdate) {
        console.error("Could not find client pack with ID:", packId);
        toast.error(
          "Session marked as completed, but failed to update remaining sessions count."
        );
        refetchSessions();
        refetchClientPack();
        return;
      }
      toast.success("Session completed successfully and package updated");
      refetchSessions();
      refetchClientPack();
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("An error occurred while completing the session");
      refetchSessions();
      refetchClientPack();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Function to check if session time has passed by at least 1 hour
  const isSessionPastDueByOneHour = (sessionDate, sessionTime) => {
    try {
      if (!sessionDate || !sessionTime) return false;

      // Normalize time string for better parsing
      const normalizedTime = normalizeTimeString(sessionTime);
      if (!normalizedTime) return false;

      // Create a date object by combining date and time
      const sessionDateTime = new Date(sessionDate);

      // Handle different time formats (both 12h and 24h)
      let hours, minutes;

      if (normalizedTime.includes("AM") || normalizedTime.includes("PM")) {
        // Handle 12-hour format (e.g., "9:00 AM")
        const parts = normalizedTime.split(" ");
        const timePart = parts[0];
        const period = parts.length > 1 ? parts[1] : null;

        if (!timePart || !period) return false;

        const timePieces = timePart.split(":");

        // Handle hour-only formats
        if (timePieces.length === 1) {
          hours = parseInt(timePieces[0], 10);
          minutes = 0;
        } else if (timePieces.length >= 2) {
          hours = parseInt(timePieces[0], 10);
          minutes = parseInt(timePieces[1], 10);
        } else {
          return false;
        }

        if (isNaN(hours) || isNaN(minutes)) return false;

        // Convert to 24-hour format
        if (period === "PM" && hours < 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }
      } else {
        // Handle 24-hour format (e.g., "09:00" or "14:30")
        const parts = normalizedTime.split(":");

        if (parts.length === 1) {
          hours = parseInt(parts[0], 10);
          minutes = 0;
        } else if (parts.length >= 2) {
          hours = parseInt(parts[0], 10);
          minutes = parseInt(parts[1], 10);
        } else {
          return false;
        }

        if (isNaN(hours) || isNaN(minutes)) return false;
      }

      // Set the time part of the date
      sessionDateTime.setHours(hours, minutes, 0, 0);

      // Get current time
      const now = new Date();

      // Calculate time difference in hours
      const timeDifferenceInHours = (now - sessionDateTime) / (1000 * 60 * 60);

      // Session is past due if it's at least 1 hour in the past
      return timeDifferenceInHours >= 1;
    } catch (error) {
      console.error(
        "Error calculating if session is past due:",
        error,
        "for time:",
        sessionTime
      );
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center">
        <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
        {t("title")}
        <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
      </h2>

      {hasActiveMemberships ? (
        <>
          {memberships.map((membership, index) => {
            const daysUntilExpiration = Math.ceil(
              (new Date(membership.expirationDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            );

            const packDetails = membership.pack;
            return (
              <motion.div
                key={membership._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-[#0a0e15] p-6 sm:p-8 rounded-lg border border-[#161c2a] mb-6"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-[#161c2a] rounded-full h-24 w-24 flex items-center justify-center">
                    <Package size={32} className="text-[#B4E90E]" />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      {packDetails?.category?.[locale] || "Loading package..."}
                    </h3>
                    <p className="text-gray-400">
                      {t("activePackage")}
                      {memberships.length > 1 ? `#${index + 1}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a]">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="text-[#B4E90E]" />
                      <h4 className="text-lg font-semibold">
                        {t("remainingSessions")}
                      </h4>
                    </div>
                    <div className="text-3xl font-bold text-center mt-4">
                      {membership.remainingSessions}
                    </div>
                    <div className="mt-4 h-2 bg-[#161c2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B4E90E]"
                        style={{
                          width: `${(membership.remainingSessions / 20) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a]">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="text-[#B4E90E]" />
                      <h4 className="text-lg font-semibold">
                        {t("daysUntilExpiration")}
                      </h4>
                    </div>
                    <div className="text-3xl font-bold text-center mt-4">
                      {daysUntilExpiration}
                    </div>
                    <div className="mt-4 h-2 bg-[#161c2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B4E90E]"
                        style={{
                          width: `${(daysUntilExpiration / 90) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Upcoming Sessions Section - with improved time display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0e15] p-6 sm:p-8 rounded-lg border border-[#161c2a] mt-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center">
              <Calendar className="mr-3 text-[#B4E90E]" />
              {t("upcomingSessions")}
            </h3>

            {sessionsLoading ? (
              <div className="text-center py-8">{t("loadingSessions")}</div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const { date } = formatDateTime(session.sessionDate);
                  const formattedTime = formatTime(session.sessionTime);
                  const isCancellable = isSessionCancellable(
                    session.sessionDate,
                    session.sessionTime
                  );
                  const isPastDueByOneHour = isSessionPastDueByOneHour(
                    session.sessionDate,
                    session.sessionTime
                  );

                  // Generate a unique key using session properties if _id is not available
                  const sessionKey =
                    session._id ||
                    `${session.sessionDate}-${session.sessionTime}-${session.coach?._id || "nocoach"}`;

                  return (
                    <div
                      key={sessionKey}
                      className="bg-[#0d111a] p-4 sm:p-6 rounded-lg border border-[#161c2a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <Calendar size={18} className="text-[#B4E90E]" />
                          </div>
                          <span className="font-semibold">{date}</span>
                          <span className="font-medium">{formattedTime}</span>

                          {/* Show session status */}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              session.status === "scheduled"
                                ? "bg-blue-400/10 text-blue-400"
                                : session.status === "pending"
                                  ? "bg-yellow-400/10 text-yellow-400"
                                  : session.status === "completed"
                                    ? "bg-green-400/10 text-green-400"
                                    : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {t(`sessionStatus.${session.status}`)}
                          </span>

                          {!isCancellable && (
                            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                              {t("cannotCancel", "Cannot cancel")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <User size={18} className="text-[#B4E90E]" />
                          </div>
                          <span>
                            Coach: {session.coach?.firstName}{" "}
                            {session.coach?.lastName || "" || "Not assigned"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <MapPin size={18} className="text-[#B4E90E]" />
                          </div>
                          <span>{session.location || "unknown location"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* For sessions past due by 1 hour, show confirm button */}
                        {isPastDueByOneHour &&
                        session.status === "scheduled" ? (
                          <button
                            onClick={() => handleCompleteSession(session)}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-end sm:self-center bg-green-500/10 hover:bg-green-500/20 text-green-400"
                          >
                            <CheckCircle size={16} />
                            {t("confirmCompleted", "Confirm Completed")}
                          </button>
                        ) : (
                          /* Otherwise show cancel button */
                          <button
                            onClick={() => handleCancelButtonClick(session)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-end sm:self-center ${
                              isCancellable
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                : "bg-gray-500/10 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!isCancellable}
                            title={
                              !isCancellable
                                ? t(
                                    "session12HourRule",
                                    "Sessions can only be cancelled at least 12 hours before start time"
                                  )
                                : ""
                            }
                          >
                            <X size={16} />
                            {t("cancelSession")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a] text-center">
                <div className="flex justify-center mb-4">
                  <Calendar size={36} className="text-gray-400" />
                </div>
                <p className="text-gray-400">{t("noUpcomingSessions")}</p>
              </div>
            )}
          </motion.div>

          {/* Finished Sessions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0a0e15] p-6 sm:p-8 rounded-lg border border-[#161c2a] mt-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center">
              <CheckCircle className="mr-3 text-[#B4E90E]" />
              {t("finishedSessions", "Finished Sessions")}
            </h3>

            {sessionsLoading ? (
              <div className="text-center py-8">{t("loadingSessions")}</div>
            ) : finishedSessions.length > 0 ? (
              <div className="space-y-4">
                {finishedSessions.map((session) => {
                  const { date } = formatDateTime(session.sessionDate);
                  const formattedTime = formatTime(session.sessionTime);

                  // Generate a unique key using session properties if _id is not available
                  const sessionKey =
                    session._id ||
                    `${session.sessionDate}-${session.sessionTime}-${session.coach?._id || "nocoach"}-finished`;

                  return (
                    <div
                      key={sessionKey}
                      className="bg-[#0d111a] p-4 sm:p-6 rounded-lg border border-[#161c2a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <Calendar size={18} className="text-[#B4E90E]" />
                          </div>
                          <span className="font-semibold">{date}</span>
                          <span className="font-medium">{formattedTime}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-400/10 text-green-400">
                            {t("completed", "Completed")}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <User size={18} className="text-[#B4E90E]" />
                          </div>
                          <span>
                            {t("coach", "Coach")}: {session.coach?.firstName}{" "}
                            {session.coach?.lastName || ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <MapPin size={18} className="text-[#B4E90E]" />
                          </div>
                          <span>{session.location || "unknown location"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a] text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={36} className="text-gray-400" />
                </div>
                <p className="text-gray-400">
                  {t("noFinishedSessions", "No finished sessions yet")}
                </p>
              </div>
            )}
          </motion.div>

          {/* Information block about cancellation policy */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-blue-400 mb-1">
                  {t("cancellationPolicy", "Cancellation Policy")}
                </h4>
                <p className="text-sm text-gray-300">
                  {t(
                    "cancellationPolicyInfo",
                    "Sessions must be cancelled at least 12 hours in advance. Late cancellations or no-shows will result in the session being deducted from your package."
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0e15] p-6 sm:p-8 rounded-lg border border-[#161c2a]"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-[#161c2a] rounded-full h-24 w-24 flex items-center justify-center">
              <Package size={32} className="text-[#B4E90E]" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                {t("noActivePackage")}
              </h3>
              <p className="text-gray-400">{t("purchaseAPackage")}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="col-span-1 md:col-span-2 bg-[#0d111a] p-6 rounded-lg border border-[#161c2a] flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="text-[#B4E90E]" />
                <h4 className="text-lg font-semibold">
                  {t("noActiveMembership")}
                </h4>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold flex justify-center gap-12 mb-6">
                  <div className="text-center">
                    <span className="block text-gray-400 text-sm mb-1">
                      {t("sessions")}
                    </span>
                    <span>0</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-400 text-sm mb-1">
                      {t("days")}
                    </span>
                    <span>0</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-6">{t("purchaseAMembership")}</p>
              </div>

              <button
                className="bg-[#B4E90E] hover:bg-[#A0D50C] text-black font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => (window.location.href = `/${locale}/`)}
              >
                <ShoppingCart size={20} />
                {t("buyAPackage")}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cancel Session Modal */}
      {cancelModalOpen && sessionToCancel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e15] p-6 rounded-lg border border-[#161c2a] max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold">{t("cancelSession")}</h3>
            </div>

            <p className="mb-6">{t("cancelSessionConfirmation")}</p>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  setSessionToCancel(null);
                }}
                className="py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                {t("keepSession")}
              </button>
              <button
                onClick={handleCancelSession}
                className="py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} />
                {t("cancelSession")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e15] p-6 rounded-lg border border-[#161c2a] max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <Info size={24} />
              <h3 className="text-xl font-bold">
                {t("cannotCancel", "Cannot Cancel Session")}
              </h3>
            </div>

            <p className="mb-6">{errorMessage}</p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="py-2 px-4 rounded-lg bg-[#161c2a] hover:bg-[#252d3d] transition-colors"
              >
                {t("ok", "OK")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Membership;