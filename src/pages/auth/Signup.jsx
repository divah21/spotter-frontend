import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '@/redux/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Truck, ArrowLeft, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'driver',
  })
  const [errors, setErrors] = useState({})

  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    dispatch(clearError())
    
    // Validation
    const newErrors = {}
    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.first_name) newErrors.first_name = 'First name is required'
    if (!formData.last_name) newErrors.last_name = 'Last name is required'
    if (!formData.phone) newErrors.phone = 'Phone is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Dispatch register action
    const result = await dispatch(registerUser({
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      password: formData.password,
      password_confirm: formData.confirmPassword,
      role: formData.role,
    }))

    // Navigate to appropriate dashboard based on role
    if (result.type === 'auth/register/fulfilled') {
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
            Join thousands of drivers using professional ELD logging and route planning
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Signup Form */}
      <motion.div variants={rightVariants} className="flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
                <CardTitle className="text-4xl font-bold text-[#021d26]">Create account</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Get started with Spotter today
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-[#032a36] font-medium">
                        First Name
                      </Label>
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="h-12 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                      {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-[#032a36] font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="h-12 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                      {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-[#032a36] font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                    </div>
                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#032a36] font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="driver@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#032a36] font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#032a36] font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#032a36] focus:ring-[#032a36] text-base"
                        disabled={loading}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[#032a36] font-medium">
                      I am a
                    </Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-[#032a36] focus:ring-2 focus:ring-[#032a36] text-base appearance-none bg-white"
                    >
                      <option value="driver">Driver</option>
                      <option value="admin">Fleet Manager/Admin</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" required className="mt-1 rounded border-gray-300 text-[#032a36] focus:ring-[#032a36]" />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-[#032a36] hover:underline font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-[#032a36] hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#032a36] hover:bg-[#021d26] text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="text-[#032a36] hover:underline font-semibold">
                        Sign in
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
