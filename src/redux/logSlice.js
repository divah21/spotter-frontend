import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import LogService from '../services/log.service'

const initialState = {
  logs: [],
  currentLog: null,
  pendingLogs: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchLogs = createAsyncThunk(
  'log/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await LogService.listLogs(params)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch logs'
      )
    }
  }
)

export const fetchLogById = createAsyncThunk(
  'log/fetchById',
  async (logId, { rejectWithValue }) => {
    try {
      const response = await LogService.getLog(logId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch log'
      )
    }
  }
)

export const submitLogsForReview = createAsyncThunk(
  'log/submit',
  async ({ logIds, notes }, { rejectWithValue }) => {
    try {
      const response = await LogService.submitLogs(logIds, notes)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit logs'
      )
    }
  }
)

export const reviewLogRequest = createAsyncThunk(
  'log/review',
  async ({ logId, action, notes }, { rejectWithValue }) => {
    try {
      const response = await LogService.reviewLog(logId, action, notes)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to review log'
      )
    }
  }
)

export const fetchLogsByTrip = createAsyncThunk(
  'log/fetchByTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await LogService.getLogsByTrip(tripId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trip logs'
      )
    }
  }
)

export const fetchPendingLogs = createAsyncThunk(
  'log/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await LogService.getPendingLogs()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch pending logs'
      )
    }
  }
)

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentLog: (state) => {
      state.currentLog = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logs
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Log By ID
      .addCase(fetchLogById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLogById.fulfilled, (state, action) => {
        state.loading = false
        state.currentLog = action.payload
      })
      .addCase(fetchLogById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Submit Logs
      .addCase(submitLogsForReview.pending, (state) => {
        state.loading = true
      })
      .addCase(submitLogsForReview.fulfilled, (state, action) => {
        state.loading = false
        // Update submitted logs in the state
        action.payload.forEach((updatedLog) => {
          const index = state.logs.findIndex((l) => l.id === updatedLog.id)
          if (index !== -1) {
            state.logs[index] = updatedLog
          }
        })
      })
      .addCase(submitLogsForReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Review Log
      .addCase(reviewLogRequest.pending, (state) => {
        state.loading = true
      })
      .addCase(reviewLogRequest.fulfilled, (state, action) => {
        state.loading = false
        const index = state.logs.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.logs[index] = action.payload
        }
        // Remove from pending logs
        state.pendingLogs = state.pendingLogs.filter((l) => l.id !== action.payload.id)
      })
      .addCase(reviewLogRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Logs By Trip
      .addCase(fetchLogsByTrip.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLogsByTrip.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload
      })
      .addCase(fetchLogsByTrip.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Pending Logs
      .addCase(fetchPendingLogs.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPendingLogs.fulfilled, (state, action) => {
        state.loading = false
        state.pendingLogs = action.payload
      })
      .addCase(fetchPendingLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentLog } = logSlice.actions
export default logSlice.reducer
