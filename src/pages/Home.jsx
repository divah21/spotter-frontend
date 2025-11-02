import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Truck, MapPin, FileText, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const features = [
    {
      icon: MapPin,
      title: 'Smart Route Planning',
      description: 'Optimize your routes with real-time HOS compliance tracking',
    },
    {
      icon: FileText,
      title: 'Automated ELD Logs',
      description: 'Generate compliant daily log sheets automatically',
    },
    {
      icon: Clock,
      title: 'HOS Tracking',
      description: 'Stay compliant with 70/8 day rules and driving limits',
    },
    {
      icon: Truck,
      title: 'Trip Management',
      description: 'Plan and track all your trips in one place',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021d26] via-[#032a36] to-[#021d26]">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen"
      >
        <motion.div variants={itemVariants} className="text-center space-y-6 max-w-4xl">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center mb-8"
          >
            <Truck className="w-16 h-16 text-[#AEC3DD] mr-4" />
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight">
              Spotter
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-[#7a95ad] max-w-2xl mx-auto"
          >
            Smart ELD Log Planning & Route Management for Professional Truck Drivers
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard')}
                  size="lg"
                  className="bg-white text-[#021d26] hover:bg-[#7a95ad] hover:text-white text-lg px-10 py-7 rounded-xl font-semibold shadow-2xl hover:shadow-white/20 transition-all duration-300 group"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate('/planner')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7 rounded-xl font-semibold backdrop-blur-sm"
                >
                  Plan a Trip
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-white text-[#021d26] hover:bg-[#7a95ad] hover:text-white text-lg px-10 py-7 rounded-xl font-semibold shadow-2xl hover:shadow-white/20 transition-all duration-300 group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate('/planner')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7 rounded-xl font-semibold backdrop-blur-sm"
                >
                  Try Demo
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full max-w-6xl"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              <feature.icon className="w-12 h-12 text-[#AEC3DD] mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-[#7a95ad] text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.div
          variants={itemVariants}
          className="mt-20 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-4xl"
        >
          <h2 className="text-white text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-3 text-[#7a95ad]">
            <p className="flex items-start gap-3">
              <span className="bg-[#AEC3DD] text-[#021d26] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </span>
              <span>Enter your current location, pickup point, and delivery destination</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="bg-[#AEC3DD] text-[#021d26] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </span>
              <span>Input your current cycle hours used (70/8 day rule)</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="bg-[#AEC3DD] text-[#021d26] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </span>
              <span>Get optimized routes with rest stops, fuel stops, and HOS-compliant scheduling</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="bg-[#AEC3DD] text-[#021d26] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </span>
              <span>View and download auto-generated ELD daily log sheets</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
