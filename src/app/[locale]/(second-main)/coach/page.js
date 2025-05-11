"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import {
  Calendar,
  CheckCircle,
  Clock,
  SearchCheck,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/authContext";
import { useGetSessionsByCoachIdQuery } from "@/redux/services/session.service";

export default function CoachDashboard() {
  const { mongoUser } = useAuth();
  const coachId = mongoUser?._id;
  const { data, isSuccess, isLoading } = useGetSessionsByCoachIdQuery(coachId, {
    skip: !coachId,
  });
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [coachSessions, setCoachSessions] = useState([]);
  const [monthlySessions, setMonthlySessions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    scheduled: 0,
    completed: 0,
    canceled: 0,
    freeSessions: 0,
    total: 0,
  });
  useEffect(() => {
    if (isSuccess && data) {
      setCoachSessions(data.sessions);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (!isLoading && coachSessions?.length > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      console.log(coachSessions);
      const stats = coachSessions.reduce(
        (acc, session) => {
          if (session.sessionDate) {
            const sessionDate = new Date(session.sessionDate);
            if (!isNaN(sessionDate.getTime())) {
              const sessionMonth = sessionDate.getMonth();
              const sessionYear = sessionDate.getFullYear();

              if (
                sessionMonth === currentMonth &&
                sessionYear === currentYear
              ) {
                const status = session.status?.toLowerCase() || "";
                if (status === "scheduled") acc.scheduled++;
                else if (status === "completed") acc.completed++;
                else if (status === "cancelled") acc.canceled++;
                if (session.freeSession) acc.freeSessions++;
              }
            }
          }
          return acc;
        },
        {
          scheduled: 0,
          completed: 0,
          canceled: 0,
          freeSessions: 0,
          total: coachSessions.length,
        }
      );

      setMonthlyStats(stats);
    } else if (!isLoading) {
      setMonthlyStats({
        scheduled: 0,
        completed: 0,
        canceled: 0,
        freeSessions: 0,
        total: 0,
      });
    }
  }, [coachSessions, isLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const sessionStatsCards = useMemo(
    () => [
      {
        title: "Sessions Scheduled",
        value: monthlyStats.scheduled.toString(),
        icon: Clock,
        description: "This month",
      },
      {
        title: "Sessions Completed",
        value: monthlyStats.completed.toString(),
        icon: CheckCircle,
        description: "This month",
      },
      {
        title: "Sessions Cancelled",
        value: monthlyStats.canceled.toString(),
        icon: XCircle,
        description: "This month",
      },
      {
        title: "Free Sessions",
        value: monthlyStats.freeSessions.toString(),
        icon: SearchCheck,
        description: "This month",
      },
      {
        title: "Total Sessions",
        value: monthlyStats.total.toString(),
        icon: Calendar,
        description: "All time",
      },
    ],
    [monthlyStats]
  );

  useEffect(() => {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    let monthsData = [];

    // Generate data for last 4 months, current month, and next 2 months
    for (let i = -4; i <= 2; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthIndex = monthDate.getMonth();
      const monthName = monthNames[monthIndex];
      const year = monthDate.getFullYear();
      const label =
        year !== now.getFullYear() ? `${monthName} ${year}` : monthName;

      monthsData.push({
        name: label,
        sessions: 0,
        monthNum: monthIndex,
        year: year,
      });
    }

    // Count sessions for each month (but only for the months in our range)
    if (coachSessions?.length > 0) {
      coachSessions.forEach((session) => {
        if (session.sessionDate) {
          const sessionDate = new Date(session.sessionDate);
          if (!isNaN(sessionDate.getTime())) {
            const sessionMonth = sessionDate.getMonth();
            const sessionYear = sessionDate.getFullYear();
            const monthEntry = monthsData.find(
              (m) => m.monthNum === sessionMonth && m.year === sessionYear
            );
            if (
              monthEntry &&
              (session.status?.toLowerCase() === "completed" ||
                session.status?.toLowerCase() === "pending" ||
                session.status?.toLowerCase() === "scheduled")
            ) {
              monthEntry.sessions++;
            }
          }
        }
      });
    }

    setMonthlySessions(monthsData);

    // Update the CardDescription to match the actual range being shown
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
  }, [coachSessions, data, isSuccess]);

  const weeklySessionsData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentWeekData = daysOfWeek.map((day, i) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      return {
        name: day,
        sessions: 0,
        fullDate: new Date(dayDate),
      };
    });

    if (coachSessions?.length > 0) {
      coachSessions.forEach((session) => {
        if (session.sessionDate) {
          const sessionDate = new Date(session.sessionDate);
          if (!isNaN(sessionDate.getTime())) {
            const dayEntry = currentWeekData.find(
              (day) =>
                sessionDate.getDate() === day.fullDate.getDate() &&
                sessionDate.getMonth() === day.fullDate.getMonth() &&
                sessionDate.getFullYear() === day.fullDate.getFullYear()
            );
            if (
              dayEntry &&
              session.status?.toLowerCase() !== "cancelled" &&
              session.status?.toLowerCase() !== "canceled"
            ) {
              dayEntry.sessions++;
            }
          }
        }
      });
    }

    return currentWeekData;
  }, [coachSessions]);

  const sortedSessionsForTable = useMemo(() => {
    if (!coachSessions?.length)
      return { upcoming: [], completed: [], cancelled: [] };

    const currentDate = new Date();
    const sortedSessions = {
      upcoming: [],
      completed: [],
      cancelled: [],
    };

    coachSessions.forEach((session) => {
      if (!session?._id) return;

      const sessionStatus = session.status?.toLowerCase() || "unknown";
      const clientName =
        `${session.client?.firstName || ""} ${session.client?.lastName || ""}`.trim() ||
        "Unknown Client";
      const sessionDate = session.sessionDate
        ? new Date(session.sessionDate)
        : null;
      const sessionDateStr =
        sessionDate && !isNaN(sessionDate.getTime())
          ? sessionDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Invalid Date";

      const sessionData = {
        id: session._id,
        client: clientName,
        date: sessionDateStr,
        time: session.sessionTime || "N/A",
        duration: `${session.duration || 60} min`,
        location: session.location || "Virtual",
        status: session.status || "unknown",
      };

      if (sessionStatus === "cancelled" || sessionStatus === "canceled") {
        sortedSessions.cancelled.push(sessionData);
      } else if (sessionStatus === "completed") {
        sortedSessions.completed.push(sessionData);
      } else if (
        (sessionStatus === "scheduled" || sessionStatus === "confirmed") &&
        sessionDate &&
        sessionDate >= currentDate.setHours(0, 0, 0, 0)
      ) {
        sortedSessions.upcoming.push(sessionData);
      }
    });

    const getDateForSort = (session) => {
      try {
        const date = new Date(`${session.date} ${session.time}`);
        return !isNaN(date.getTime()) ? date : new Date(0);
      } catch (e) {
        return new Date(0);
      }
    };

    sortedSessions.upcoming.sort(
      (a, b) => getDateForSort(a) - getDateForSort(b)
    );
    sortedSessions.completed.sort(
      (a, b) => getDateForSort(b) - getDateForSort(a)
    );
    sortedSessions.cancelled.sort(
      (a, b) => getDateForSort(b) - getDateForSort(a)
    );

    return sortedSessions;
  }, [coachSessions]);

  const mainColor = "#B4E90E";

  if (!mounted) return null;

  return (
    <div className="container py-6 overflow-x-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Coach Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor your coaching sessions and client progress
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
        >
          {sessionStatsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white py-2">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-[#B4E90E]" />
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.description}
                  </p>
                  <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: mainColor }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(Number.parseInt(stat.value) / 20) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-2"
        >
          <Card className="shadow-md bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white py-2">
                Monthly Sessions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Number of sessions per month over the last 4 months, current
                month, and next 2 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySessions}>
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
                      color: "#F9FAFB",
                    }}
                    formatter={(value) => [`${value} sessions`, "Sessions"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar
                    dataKey="sessions"
                    fill={mainColor}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="sessions"
                      position="top"
                      fill="#D1D5DB"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white py-2">
                This Week&apos;s Sessions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Sessions progression throughout the week
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySessionsData}>
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
                      color: "#F9FAFB",
                    }}
                    formatter={(value) => [`${value} sessions`, "Sessions"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke={mainColor}
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: mainColor,
                      strokeWidth: 2,
                      stroke: "#1F2937",
                    }}
                    activeDot={{
                      r: 8,
                      fill: mainColor,
                      strokeWidth: 2,
                      stroke: "#1F2937",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white py-2">
                Coaching Sessions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage all your scheduled sessions
              </CardDescription>
              <div className="flex space-x-1 mt-2 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "upcoming" ? "text-[#B4E90E] border-b-2 border-[#B4E90E]" : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"}`}
                >
                  Upcoming ({sortedSessionsForTable.upcoming.length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "completed" ? "text-[#B4E90E] border-b-2 border-[#B4E90E]" : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"}`}
                >
                  Completed ({sortedSessionsForTable.completed.length})
                </button>
                <button
                  onClick={() => setActiveTab("cancelled")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "cancelled" ? "text-[#B4E90E] border-b-2 border-[#B4E90E]" : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent"}`}
                >
                  Cancelled ({sortedSessionsForTable.cancelled.length})
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-10 text-gray-400">
                  Loading sessions...
                </div>
              ) : sortedSessionsForTable[activeTab]?.length > 0 ? (
                <div className="rounded-md border border-gray-800 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-800">
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300 whitespace-nowrap">
                          Client
                        </TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">
                          Date
                        </TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">
                          Time
                        </TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">
                          Duration
                        </TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">
                          Location
                        </TableHead>
                        <TableHead className="text-gray-300 whitespace-nowrap">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSessionsForTable[activeTab].map((session) => (
                        <TableRow
                          key={session.id}
                          className="hover:bg-gray-800/50 border-gray-800"
                        >
                          <TableCell className="font-medium text-white">
                            {session.client}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {session.date}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {session.time}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {session.duration}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {session.location}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                session.status.toLowerCase() === "confirmed"
                                  ? "bg-blue-900 text-blue-200"
                                  : session.status.toLowerCase() === "scheduled"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : session.status.toLowerCase() ===
                                        "completed"
                                      ? "bg-green-900 text-green-200"
                                      : session.status.toLowerCase() ===
                                            "canceled" ||
                                          session.status.toLowerCase() ===
                                            "cancelled"
                                        ? "bg-red-900 text-red-200"
                                        : "bg-gray-700 text-gray-300"
                              } capitalize`}
                            >
                              {session.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No {activeTab} sessions found.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}