import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '@/redux/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Truck, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    dispatch(clearError())
    
    // Basic validation
    const newErrors = {}
    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Dispatch login action
    const result = await dispatch(loginUser({
      username: formData.username,
      password: formData.password,
    }))

    // Navigate to appropriate dashboard based on role
    if (result.type === 'auth/login/fulfilled') {
      const userRole = result.payload.user.role
      if (userRole === 'driver') {
        navigate('/driver/dashboard')
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard')
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const leftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const rightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen grid lg:grid-cols-2"
    >
      {/* Left side - Branding */}
      <motion.div
        variants={leftVariants}
        className="hidden lg:flex relative bg-gradient-to-br from-[#021d26] via-[#032a36] to-[#021d26] items-center justify-center p-12"
      >
        <div className="space-y-8 text-center max-w-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <Truck className="h-20 w-20 text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-6xl font-bold text-white"
          >
            Spotter
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl text-[#7a95ad]"
          >
            Professional ELD logging and route planning for modern trucking operations
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div variants={rightVariants} className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-6 text-[#032a36] hover:text-[#021d26]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="space-y-2 pb-6 pt-8 px-8">
                <CardTitle className="text-4xl font-bold text-[#021d26]">Welcome back</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-[#032a36] font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                    </div>
                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#032a36] font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-[#032a36] focus:ring-[#032a36]" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link to="/auth/forgot-password" className="text-sm text-[#032a36] hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#032a36] hover:bg-[#021d26] text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-[#032a36] hover:underline font-semibold">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
