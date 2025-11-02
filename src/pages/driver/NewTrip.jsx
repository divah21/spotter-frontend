import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setTripData } from '@/redux/tripSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ArrowRight, MapPin, Navigation } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NewTrip() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    currentCycleUsed: '',
  })
  const [errors, setErrors] = useState({})

  // Immediate redirect to unified planner per product flow
  useEffect(() => {
    // Navigate the driver to the dedicated planner page inside dashboard
    navigate('/driver/planner', { replace: true })
  }, [navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = 'Current location is required'
    }
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required'
    }
    if (!formData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = 'Dropoff location is required'
    }
    if (!formData.currentCycleUsed.trim()) {
      newErrors.currentCycleUsed = 'Current cycle hours is required'
    } else {
      const hours = parseFloat(formData.currentCycleUsed)
      if (isNaN(hours) || hours < 0 || hours > 70) {
        newErrors.currentCycleUsed = 'Must be between 0 and 70 hours'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      dispatch(
        setTripData({
          currentLocation: formData.currentLocation,
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          currentCycleUsed: parseFloat(formData.currentCycleUsed),
        })
      )
      // For consistency, send users to the planner within driver layout
      // which performs routing + ELD generation and then forwards to results
      navigate('/driver/planner')
    }
  }

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-[#053E4F]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#053E4F] to-[#AEC3DD] text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Plan New Trip
            </CardTitle>
            <CardDescription className="text-white/90">
              Enter your trip details to generate route and ELD logs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentLocation" className="text-[#053E4F] font-semibold">
                  Current Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="currentLocation"
                    placeholder="e.g., New York, NY"
                    value={formData.currentLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, currentLocation: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                {errors.currentLocation && (
                  <p className="text-sm text-red-500">{errors.currentLocation}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupLocation" className="text-[#053E4F] font-semibold">
                  Pickup Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="pickupLocation"
                    placeholder="e.g., Chicago, IL"
                    value={formData.pickupLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupLocation: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                {errors.pickupLocation && (
                  <p className="text-sm text-red-500">{errors.pickupLocation}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoffLocation" className="text-[#053E4F] font-semibold">
                  Dropoff Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="dropoffLocation"
                    placeholder="e.g., Los Angeles, CA"
                    value={formData.dropoffLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, dropoffLocation: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                {errors.dropoffLocation && (
                  <p className="text-sm text-red-500">{errors.dropoffLocation}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCycleUsed" className="text-[#053E4F] font-semibold">
                  Current Cycle Used (Hours)
                </Label>
                <Input
                  id="currentCycleUsed"
                  type="number"
                  step="0.5"
                  min="0"
                  max="70"
                  placeholder="e.g., 15.5"
                  value={formData.currentCycleUsed}
                  onChange={(e) =>
                    setFormData({ ...formData, currentCycleUsed: e.target.value })
                  }
                />
                {errors.currentCycleUsed && (
                  <p className="text-sm text-red-500">{errors.currentCycleUsed}</p>
                )}
                <p className="text-sm text-gray-500">
                  Enter hours already used in your current 8-day cycle (max 70 hours)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#053E4F] hover:bg-[#032a36] text-white text-lg py-6"
              >
                Calculate Route & Generate Logs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    
  )
}
