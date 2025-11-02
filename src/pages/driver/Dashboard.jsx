import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, Truck, MapPin, FileText, Plus, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchTrips } from '@/redux/tripSlice'
import { fetchLogs } from '@/redux/logSlice'

export default function DriverDashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const { trips, loading: tripsLoading } = useSelector((state) => state.trip)
  const { logs, loading: logsLoading } = useSelector((state) => state.log)
  const [stats, setStats] = useState({
    hoursRemaining: 0,
    activeTrips: 0,
    milesToday: 0,
    logsCompleted: 0,
  })

  useEffect(() => {
    // Fetch real data
    dispatch(fetchTrips())
    dispatch(fetchLogs())
  }, [dispatch])

  useEffect(() => {
    // Calculate stats from real data
    if (trips && logs) {
      const activeTrips = trips.filter(
        (t) => t.status === 'in_progress' || t.status === 'approved'
      ).length

      const totalCycleUsed = trips.reduce((sum, t) => sum + (t.current_cycle_used || 0), 0)
      const hoursRemaining = Math.max(0, 70 - totalCycleUsed)

      const today = new Date().toISOString().split('T')[0]
      const todayLogs = logs.filter((l) => l.date === today || l.log_date === today)
      const milesToday = todayLogs.reduce((sum, l) => sum + (l.total_miles || 0), 0)

      const completedLogs = logs.filter((l) => l.submission_status === 'approved').length

      setStats({
        hoursRemaining: hoursRemaining.toFixed(1),
        activeTrips,
        milesToday,
        logsCompleted: completedLogs,
      })
    }
  }, [trips, logs])

  const statsConfig = [
    {
      title: 'Hours Remaining',
      value: stats.hoursRemaining,
      subtitle: 'of 70 hours',
      icon: Clock,
      color: 'bg-[#021d26]',
    },
    {
      title: 'Active Trips',
      value: stats.activeTrips,
      subtitle: 'in progress',
      icon: Truck,
      color: 'bg-[#7a95ad]',
    },
    {
      title: 'Miles Today',
      value: stats.milesToday,
      subtitle: 'of 550 planned',
      icon: MapPin,
      color: 'bg-[#9a8565]',
    },
    {
      title: 'Logs Completed',
      value: stats.logsCompleted,
      subtitle: 'this cycle',
      icon: FileText,
      color: 'bg-[#032a36]',
    },
  ]

  // Get recent trips: show most recent regardless of status to ensure visibility
  const recentTrips = [...(trips || [])]
    .sort((a, b) => {
      const aTime = new Date(a.created_at || a.created || 0).getTime()
      const bTime = new Date(b.created_at || b.created || 0).getTime()
      if (bTime !== aTime) return bTime - aTime
      return (b.id || 0) - (a.id || 0)
    })
    .slice(0, 3)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#021d26]">Welcome back, {user?.name || 'Driver'}</h1>
            <p className="text-gray-500 mt-1">Here's your driving overview for today</p>
          </div>
          <Button
            onClick={() => navigate('/driver/trips/new')}
            className="bg-[#021d26] hover:bg-[#032a36] shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Plan New Trip
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.title} variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                    <div className={`${stat.color} p-3 rounded-xl shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#021d26]">
                      {tripsLoading || logsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Recent Trips */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-[#021d26]">Recent Trips</CardTitle>
              <CardDescription>Your current and upcoming trips</CardDescription>
            </CardHeader>
            <CardContent>
              {tripsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#021d26]" />
                </div>
              ) : recentTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active trips. Plan your first trip!
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTrips.map((trip) => (
                    <motion.div
                      key={trip.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/driver/trips/${trip.id}`)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#021d26]" />
                          <span className="font-medium text-[#021d26]">
                            {trip.pickup_location} → {trip.dropoff_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Status: {trip.status.replace('_', ' ')}</span>
                          <span>Hours Used: {trip.current_cycle_used || 0}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 sm:mt-0 bg-transparent">
                        View Details
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-3">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/driver/trips/new')}
            >
              <CardHeader>
                <CardTitle className="text-[#021d26] flex items-center gap-2">
                  <Truck className="h-6 w-6" />
                  Plan Trip
                </CardTitle>
                <CardDescription>Create a new trip with route and ELD logs</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/driver/logs')}
            >
              <CardHeader>
                <CardTitle className="text-[#021d26] flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  View Logs
                </CardTitle>
                <CardDescription>Access your ELD daily log sheets</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#021d26] flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  HOS Status
                </CardTitle>
                <CardDescription>Check your hours of service compliance</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    
  )
}
