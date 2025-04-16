import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Calendar, Clock, Package, ShoppingCart, User, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/authContext';

const MemberShip = () => {
  const { mongoUser } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [hasActiveMemberships, setHasActiveMemberships] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  useEffect(() => {
    if (mongoUser?._id) {
      const fetchMembershipInfo = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/client-pack?clientId=${mongoUser._id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch membership info');
          }
          const data = await response.json();
          
          // Filter for completed packs that are not expired
          const currentDate = new Date();
          const activeMemberships = data.filter(pack => 
            pack.purchaseState === 'completed' && 
            new Date(pack.expirationDate) > currentDate
          );

          setHasActiveMemberships(activeMemberships.length > 0);
          
          setMemberships(activeMemberships);
          setLoading(false);
          
          // If we have active memberships, fetch upcoming sessions
          if (activeMemberships.length > 0) {
            fetchUpcomingSessions();
          }
        } catch (error) {
          console.error('Error fetching membership info:', error);
          setLoading(false);
        }
      };

      fetchMembershipInfo();
    } else {
      setLoading(false);
    }
  }, [mongoUser]);

  const fetchUpcomingSessions = async () => {
    setSessionLoading(true);
    try {
      // Adjust this URL to your API endpoint for sessions
      const response = await fetch(`http://localhost:3000/api/session?clientId=${mongoUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming sessions');
      }
      const data = await response.json();
      // Filter sessions to only include those with status 'scheduled'
      const scheduledSessions = data.filter(session => session.status === 'scheduled');
      setUpcomingSessions(scheduledSessions);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCancelSession = async () => {
    if (!sessionToCancel) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/session?id=${sessionToCancel._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }
      
      // Update local state to reflect the cancellation
      setUpcomingSessions(prev => 
        prev.filter(session => session._id !== sessionToCancel._id)
      );
      
      // Close the modal
      setCancelModalOpen(false);
      setSessionToCancel(null);
    } catch (error) {
      console.error('Error cancelling session:', error);
      alert('Failed to cancel session. Please try again.');
    }
  };

  // useEffect(() => {
  //   if (memberships.length > 0) {
  //     const packDetails = memberships[0].pack; // Assuming you want to set the first active membership's pack ID
  //     setPackId(packDetails._id);
  //   }
  // }, [memberships, setPackId]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="text-white">Loading...</div></div>;
  }

  // Helper function to format date
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center">
        <span className="w-6 sm:w-8 h-1 bg-[#B4E90E] mr-3 sm:mr-4"></span>
        Membership Details
      </h2>

      {hasActiveMemberships ? (
        <>
          {memberships.map((membership, index) => {
            // Calculate days until expiration for this membership
            const daysUntilExpiration = Math.ceil(
              (new Date(membership.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            
            // Get pack details directly from the populated data
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
                      {packDetails?.category || "Loading package..."}
                    </h3>
                    <p className="text-gray-400">Active Package {memberships.length > 1 ? `#${index + 1}` : ""}</p>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a]">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="text-[#B4E90E]" />
                      <h4 className="text-lg font-semibold">Remaining Sessions</h4>
                    </div>
                    <div className="text-3xl font-bold text-center mt-4">{membership.remainingSessions}</div>
                    <div className="mt-4 h-2 bg-[#161c2a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#B4E90E]" 
                        style={{ width: `${(membership.remainingSessions / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a]">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="text-[#B4E90E]" />
                      <h4 className="text-lg font-semibold">Days Until Expiration</h4>
                    </div>
                    <div className="text-3xl font-bold text-center mt-4">{daysUntilExpiration}</div>
                    <div className="mt-4 h-2 bg-[#161c2a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#B4E90E]" 
                        style={{ width: `${(daysUntilExpiration / 90) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Upcoming Sessions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0e15] p-6 sm:p-8 rounded-lg border border-[#161c2a] mt-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center">
              <Calendar className="mr-3 text-[#B4E90E]" />
              Upcoming Sessions
            </h3>
            
            {sessionLoading ? (
              <div className="text-center py-8">Loading sessions...</div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session, idx) => {
                  const { date } = formatDateTime(session.sessionDate);
                  return (
                    <div 
                      key={session._id || idx} 
                      className="bg-[#0d111a] p-4 sm:p-6 rounded-lg border border-[#161c2a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <Calendar size={18} className="text-[#B4E90E]" />
                          </div>
                          <span className="font-semibold">{date}</span>
                          <span className="font-medium">{session.sessionTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="p-2 bg-[#161c2a] rounded-full">
                            <User size={18} className="text-[#B4E90E]" />
                          </div>
                          <span>Coach: {session.coach?.firstName} {session.coach?.lastName || "" || "Not assigned"}</span>
                        </div>

                      </div>
                      
                      <button 
                        onClick={() => {
                          setSessionToCancel(session);
                          setCancelModalOpen(true);
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-end sm:self-center"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#0d111a] p-6 rounded-lg border border-[#161c2a] text-center">
                <div className="flex justify-center mb-4">
                  <Calendar size={36} className="text-gray-400" />
                </div>
                <p className="text-gray-400">No upcoming sessions scheduled</p>
                <button 
                  className="mt-6 bg-[#B4E90E] hover:bg-[#A0D50C] text-black font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                  onClick={() => window.location.href = '/book-session'}
                >
                  <Calendar size={18} />
                  Book a Session
                </button>
              </div>
            )}
          </motion.div>
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
              <h3 className="text-xl sm:text-2xl font-bold mb-2">No Active Package</h3>
              <p className="text-gray-400">Purchase a package to get started</p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="col-span-1 md:col-span-2 bg-[#0d111a] p-6 rounded-lg border border-[#161c2a] flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="text-[#B4E90E]" />
                <h4 className="text-lg font-semibold">No Active Membership</h4>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold flex justify-center gap-12 mb-6">
                  <div className="text-center">
                    <span className="block text-gray-400 text-sm mb-1">Sessions</span>
                    <span>0</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-400 text-sm mb-1">Days</span>
                    <span>0</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-6">Purchase a membership to access our services</p>
              </div>
              
              <button 
                className="bg-[#B4E90E] hover:bg-[#A0D50C] text-black font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => window.location.href = '/packages'}
              >
                <ShoppingCart size={20} />
                Buy a Package
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
              <h3 className="text-xl font-bold">Cancel Session</h3>
            </div>
            
            <p className="mb-6">Are you sure you want to cancel your session on {formatDateTime(sessionToCancel.dateTime).date} at {formatDateTime(sessionToCancel.dateTime).time}?</p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button 
                onClick={() => {
                  setCancelModalOpen(false);
                  setSessionToCancel(null);
                }}
                className="py-2 px-4 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                Keep Session
              </button>
              <button 
                onClick={handleCancelSession}
                className="py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} />
                Cancel Session
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default MemberShip