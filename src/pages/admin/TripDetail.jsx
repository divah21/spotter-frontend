import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import TripDetailView from '../driver/TripDetail'
import { fetchTripById } from '@/redux/tripSlice'

export default function AdminTripDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentTrip } = useSelector((state) => state.trip)

  useEffect(() => {
    if (id) dispatch(fetchTripById(id))
  }, [id, dispatch])

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    )
  }

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4">
      </motion.div>
      <TripDetailView />
    </div>
  )
}
