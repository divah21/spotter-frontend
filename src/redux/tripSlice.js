import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import TripService from '../services/trip.service'

const initialState = {
  trips: [],
  currentTrip: null,
  tripData: null,
  routeData: null,
  eldLogs: [],
  loading: false,
  error: null,
}

// Async thunks
export const planTrip = createAsyncThunk(
  'trip/plan',
  async ({ current_location, pickup_location, dropoff_location, current_cycle_used }, { rejectWithValue }) => {
    try {
      const response = await TripService.planTrip(current_location, pickup_location, dropoff_location, current_cycle_used)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to plan trip'
      )
    }
  }
)

export const fetchTrips = createAsyncThunk(
  'trip/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await TripService.listTrips(params)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trips'
      )
    }
  }
)

export const fetchTripById = createAsyncThunk(
  'trip/fetchById',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await TripService.getTrip(tripId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trip'
      )
    }
  }
)

export const createNewTrip = createAsyncThunk(
  'trip/create',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await TripService.createTrip(tripData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create trip'
      )
    }
  }
)

export const updateExistingTrip = createAsyncThunk(
  'trip/update',
  async ({ tripId, tripData }, { rejectWithValue }) => {
    try {
      const response = await TripService.updateTrip(tripId, tripData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update trip'
      )
    }
  }
)

export const deleteExistingTrip = createAsyncThunk(
  'trip/delete',
  async (tripId, { rejectWithValue }) => {
    try {
      await TripService.deleteTrip(tripId)
      return tripId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete trip'
      )
    }
  }
)

export const submitTripForApproval = createAsyncThunk(
  'trip/submit',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await TripService.submitTrip(tripId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit trip'
      )
    }
  }
)

export const approveTripRequest = createAsyncThunk(
  'trip/approve',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await TripService.approveTrip(tripId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve trip'
      )
    }
  }
)

export const rejectTripRequest = createAsyncThunk(
  'trip/reject',
  async ({ tripId, notes }, { rejectWithValue }) => {
    try {
      const response = await TripService.rejectTrip(tripId, notes)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject trip'
      )
    }
  }
)

export const startTripJourney = createAsyncThunk(
  'trip/start',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await TripService.startTrip(tripId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to start trip'
      )
    }
  }
)

export const completeTripJourney = createAsyncThunk(
  'trip/complete',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await TripService.completeTrip(tripId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to complete trip'
      )
    }
  }
)

export const cancelTripJourney = createAsyncThunk(
  'trip/cancel',
  async ({ tripId, notes }, { rejectWithValue }) => {
    try {
      const response = await TripService.cancelTrip(tripId, notes)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel trip'
      )
    }
  }
)

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setTripData: (state, action) => {
      state.tripData = action.payload
    },
    setRouteData: (state, action) => {
      state.routeData = action.payload
    },
    setELDLogs: (state, action) => {
      state.eldLogs = action.payload
    },
    clearTripData: (state) => {
      state.tripData = null
      state.routeData = null
      state.eldLogs = []
      state.currentTrip = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Plan Trip
      .addCase(planTrip.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(planTrip.fulfilled, (state, action) => {
        state.loading = false
        state.routeData = action.payload
      })
      .addCase(planTrip.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Trips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false
        state.trips = action.payload
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Trip By ID
      .addCase(fetchTripById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.loading = false
        state.currentTrip = action.payload
      })
      .addCase(fetchTripById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Trip
      .addCase(createNewTrip.pending, (state) => {
        state.loading = true
      })
      .addCase(createNewTrip.fulfilled, (state, action) => {
        state.loading = false
        state.trips.push(action.payload)
        state.currentTrip = action.payload
      })
      .addCase(createNewTrip.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Trip
      .addCase(updateExistingTrip.pending, (state) => {
        state.loading = true
      })
      .addCase(updateExistingTrip.fulfilled, (state, action) => {
        state.loading = false
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
      .addCase(updateExistingTrip.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Trip
      .addCase(deleteExistingTrip.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteExistingTrip.fulfilled, (state, action) => {
        state.loading = false
        state.trips = state.trips.filter((t) => t.id !== action.payload)
      })
      .addCase(deleteExistingTrip.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Submit Trip
      .addCase(submitTripForApproval.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
      // Approve Trip
      .addCase(approveTripRequest.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
      // Reject Trip
      .addCase(rejectTripRequest.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
      // Start Trip
      .addCase(startTripJourney.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
      // Complete Trip
      .addCase(completeTripJourney.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
      // Cancel Trip
      .addCase(cancelTripJourney.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.trips[index] = action.payload
        }
        state.currentTrip = action.payload
      })
  },
})

export const { setTripData, setRouteData, setELDLogs, clearTripData, clearError } = tripSlice.actions
export default tripSlice.reducer
