import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, Truck, Clock, FileText, TrendingUp, TrendingDown, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LineChart, BarChart } from '@/components/Charts'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTrips } from '@/redux/tripSlice'
import { fetchLogs } from '@/redux/logSlice'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const { trips } = useSelector((state) => state.trip)
  const { logs } = useSelector((state) => state.log)
  // Simple chat state persisted to localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('admin_chat')
    return saved ? JSON.parse(saved) : [
      { id: 1, from: 'system', text: 'Welcome to Dispatch Chat. How can we help drivers today?', ts: Date.now() }
    ]
  })
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('admin_chat', JSON.stringify(messages))
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!draft.trim()) return
    const mine = { id: Date.now(), from: 'admin', text: draft.trim(), ts: Date.now() }
    setMessages((m) => [...m, mine])
    setDraft('')
    // Simulated reply from "Support Bot"
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: 'bot', text: 'Roger that. I have notified the driver. ✅', ts: Date.now() },
      ])
    }, 900)
  }
  useEffect(() => {
    dispatch(fetchTrips())
    dispatch(fetchLogs())
  }, [dispatch])

  const activeTrips = trips.filter(t => ['in_progress', 'approved', 'pending'].includes(t.status)).length
  const totalHoursLogged = logs.reduce((sum, l) => sum + ((l.hours_off_duty||0)+(l.hours_sleeper||0)+(l.hours_driving||0)+(l.hours_on_duty||0)), 0)
  const stats = [
    { title: 'Total Trips', value: String(trips.length), change: '', trend: 'up', icon: Truck, color: 'bg-[#053E4F]' },
    { title: 'Active Trips', value: String(activeTrips), change: '', trend: 'up', icon: Truck, color: 'bg-[#AEC3DD]' },
    { title: 'Total Hours Logged', value: totalHoursLogged.toFixed(1), change: '', trend: 'up', icon: Clock, color: 'bg-[#BDAB8F]' },
    { title: 'Logs', value: String(logs.length), change: '', trend: 'up', icon: FileText, color: 'bg-[#053E4F]' },
  ]

  const recentActivity = trips.slice(0,5).map(t => ({
    driver: t.driver_info ? `${t.driver_info.first_name} ${t.driver_info.last_name}` : 'Driver',
    action: `Trip ${t.pickup_location} → ${t.dropoff_location} (${t.status.replace('_',' ')})`,
    time: new Date(t.created_at).toLocaleString(),
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-[#053E4F]">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of all drivers and trips</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.title} variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#053E4F]">{stat.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-[#053E4F]">Recent Activity</CardTitle>
              <CardDescription>Latest actions from your drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between pb-4 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-[#053E4F]">{activity.driver}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Placeholder */}
        <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2">
          <motion.div variants={itemVariants}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-[#053E4F]">Hours Logged This Week</CardTitle>
                <CardDescription>Sum of hours submitted by all drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={[8, 10.5, 9, 11, 10, 7.5, 8.5]}
                  labels={["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]}
                  color="#2563eb"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-[#053E4F]">Trip Distribution</CardTitle>
                <CardDescription>Number of trips by status</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[18, 23, 12]}
                  labels={["Scheduled","In Prog.","Completed"]}
                  color="#10b981"
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Simple Chat */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-[#053E4F]">Dispatch Chat</CardTitle>
              <CardDescription>Message drivers or support. This demo persists locally.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-auto border rounded-lg p-3 bg-slate-50">
                {messages.map((m) => (
                  <div key={m.id} className={`mb-2 flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${m.from === 'admin' ? 'bg-blue-600 text-white' : m.from === 'bot' ? 'bg-emerald-100 text-emerald-900' : 'bg-white border'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="flex gap-2 mt-3">
                <Input value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Type a message…" onKeyDown={(e)=>{ if (e.key==='Enter') send() }} />
                <Button onClick={send}><Send className="w-4 h-4 mr-1"/>Send</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
  )
}
