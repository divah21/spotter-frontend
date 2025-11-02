import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import UserService from '../services/user.service'

const initialState = {
  users: [],
  currentUser: null,
  drivers: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await UserService.listUsers(params)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      )
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await UserService.getUser(userId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      )
    }
  }
)

export const createNewUser = createAsyncThunk(
  'user/create',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await UserService.createUser(userData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user'
      )
    }
  }
)

export const updateExistingUser = createAsyncThunk(
  'user/update',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await UserService.updateUser(userId, userData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      )
    }
  }
)

export const deleteExistingUser = createAsyncThunk(
  'user/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await UserService.deleteUser(userId)
      return userId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      )
    }
  }
)

export const toggleUserStatus = createAsyncThunk(
  'user/toggleStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await UserService.toggleUserStatus(userId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle user status'
      )
    }
  }
)

export const fetchDrivers = createAsyncThunk(
  'user/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getDrivers()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch drivers'
      )
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch User By ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create User
      .addCase(createNewUser.pending, (state) => {
        state.loading = true
      })
      .addCase(createNewUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update User
      .addCase(updateExistingUser.pending, (state) => {
        state.loading = true
      })
      .addCase(updateExistingUser.fulfilled, (state, action) => {
        state.loading = false
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        state.currentUser = action.payload
      })
      .addCase(updateExistingUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete User
      .addCase(deleteExistingUser.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteExistingUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter((u) => u.id !== action.payload)
      })
      .addCase(deleteExistingUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Toggle Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      // Fetch Drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false
        state.drivers = action.payload
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentUser } = userSlice.actions
export default userSlice.reducer
