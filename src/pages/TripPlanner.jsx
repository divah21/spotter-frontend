import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowLeft, Navigation, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import LocationInput from '@/components/LocationInput'
import { planTrip, createNewTrip, setTripData, setRouteData } from '@/redux/tripSlice'

export default function TripPlannerPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, routeData } = useSelector((state) => state.trip)
  const user = useSelector((state) => state.auth.user)

  const [formData, setFormData] = useState({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    currentCycleUsed: '',
  })

  const [errors, setErrors] = useState({})

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      const tripDataObj = {
        currentLocation: formData.currentLocation,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        currentCycleUsed: parseFloat(formData.currentCycleUsed),
      }

      // Store form data temporarily
      dispatch(setTripData(tripDataObj))

      // Plan the trip (calls backend API to calculate route and generate ELD logs)
      const result = await dispatch(planTrip({
        current_location: formData.currentLocation,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        current_cycle_used: parseFloat(formData.currentCycleUsed),
      }))

      if (result.type === 'trip/plan/fulfilled') {
        // Navigate to results to review the planned trip
        navigate('/driver/results')
      } else {
        setErrors({ submit: error || 'Error calculating route. Please try again.' })
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
            <Button
              variant="ghost"
              onClick={() => navigate('/driver/dashboard')}
            className="text-[#053E4F]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-[#053E4F]/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#053E4F] to-[#AEC3DD] text-white rounded-t-xl">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Navigation className="w-6 h-6" />
                Trip Planner
              </CardTitle>
              <CardDescription className="text-white/90">
                Enter your trip details to generate route and ELD logs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <LocationInput
                  id="currentLocation"
                  label="Current Location"
                  placeholder="e.g., Harare, Zimbabwe"
                  value={formData.currentLocation}
                  onChange={(value) => handleInputChange('currentLocation', value)}
                  error={errors.currentLocation}
                  showCurrentLocation={true}
                  disabled={loading}
                />

                <LocationInput
                  id="pickupLocation"
                  label="Pickup Location"
                  placeholder="e.g., Bulawayo, Zimbabwe"
                  value={formData.pickupLocation}
                  onChange={(value) => handleInputChange('pickupLocation', value)}
                  error={errors.pickupLocation}
                  disabled={loading}
                />

                <LocationInput
                  id="dropoffLocation"
                  label="Dropoff Location"
                  placeholder="e.g., Mutare, Zimbabwe"
                  value={formData.dropoffLocation}
                  onChange={(value) => handleInputChange('dropoffLocation', value)}
                  error={errors.dropoffLocation}
                  disabled={loading}
                />

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
                    onChange={(e) => handleInputChange('currentCycleUsed', e.target.value)}
                  />
                  {errors.currentCycleUsed && (
                    <p className="text-sm text-red-500">{errors.currentCycleUsed}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Enter hours used in current 8-day cycle (70-hour rule)
                  </p>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating Route...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                        Calculate Route & Generate Logs
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h3 className="font-semibold text-[#053E4F] mb-2">HOS Rules Applied:</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• 70 hours in 8 days (property-carrying)</li>
              <li>• 11 hour driving limit per day</li>
              <li>• 14 hour on-duty limit per day</li>
              <li>• 30-minute break after 8 hours of driving</li>
              <li>• 10 hour rest period required</li>
              <li>• Fuel stop every 1,000 miles</li>
              <li>• 1 hour for pickup and drop-off</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
