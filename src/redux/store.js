import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import tripReducer from './tripSlice'
import authReducer from './authSlice'
import userReducer from './userSlice'
import logReducer from './logSlice'

const rootReducer = combineReducers({
  trip: tripReducer,
  auth: authReducer,
  user: userReducer,
  log: logReducer,
})

const persistConfig = {
  key: 'spotter-root',
  storage,
  whitelist: ['auth'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)
