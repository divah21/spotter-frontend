import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, Navigation2 } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { AlertDialog } from './ui/Dialog'

// Nominatim API (OpenStreetMap) - Free geocoding service
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

// Debounce utility
let searchTimeout = null

export default function LocationInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  showCurrentLocation = false,
  disabled = false,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [searchingLocations, setSearchingLocations] = useState(false)
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' })
  const wrapperRef = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      setSearchingLocations(false)
      return
    }

    setSearchingLocations(true)

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?` +
          new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '8',
            'accept-language': 'en',
          }),
        {
          headers: {
            'User-Agent': 'Spotter-App/1.0', // Required by Nominatim usage policy
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }

      const data = await response.json()
      const locations = data.map((item) => ({
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }))

      setSuggestions(locations)
      setShowSuggestions(locations.length > 0)
    } catch (error) {
      console.error('Error searching locations:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setSearchingLocations(false)
    }
  }

  const handleInputChange = (e) => {
    const inputValue = e.target.value
    onChange(inputValue)

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // If input is too short, clear suggestions
    if (!inputValue || inputValue.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      setSearchingLocations(false)
      return
    }

    // Show searching state immediately
    setSearchingLocations(true)
    setShowSuggestions(true)

    // Debounce search - wait 500ms after user stops typing
    searchTimeout = setTimeout(() => {
      searchLocations(inputValue)
    }, 500)
  }

  const handleSelectSuggestion = (location) => {
    onChange(location.displayName)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?` +
          new URLSearchParams({
            lat: latitude,
            lon: longitude,
            format: 'json',
            'accept-language': 'en',
          }),
        {
          headers: {
            'User-Agent': 'Spotter-App/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to reverse geocode')
      }

      const data = await response.json()
      return data.display_name
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      // Fallback to coordinates if reverse geocoding fails
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAlertDialog({
        isOpen: true,
        title: 'Geolocation Not Supported',
        message: 'Geolocation is not supported by your browser. Please enter your location manually.'
      })
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Use reverse geocoding to get address from coordinates
          const address = await reverseGeocode(latitude, longitude)
          onChange(address)
          console.log('Current location:', { latitude, longitude, address })
        } catch (error) {
          console.error('Error getting address:', error)
          // Fallback to coordinates
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } finally {
          setLoadingLocation(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        setAlertDialog({
          isOpen: true,
          title: 'Location Error',
          message: 'Unable to retrieve your location. Please enter your location manually.'
        })
        setLoadingLocation(false)
      }
    )
  }

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[#053E4F]">
          {label}
        </label>
        {showCurrentLocation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={getCurrentLocation}
            disabled={loadingLocation || disabled}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {loadingLocation ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <Navigation2 className="w-3 h-3 mr-1" />
                Use current location
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          disabled={disabled}
          className="pl-10"
          autoComplete="off"
        />
        {searchingLocations && (
          <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-600 animate-spin z-10" />
        )}
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchingLocations ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching locations...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(location)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-start gap-2 transition-colors border-b last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{location.displayName}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No locations found. Try a different search.
              </div>
            )}
          </div>
        )}
      </div>
      
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-500">Type at least 3 characters to search locations</p>
      )}

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '' })}
        title={alertDialog.title}
        message={alertDialog.message}
      />
    </div>
  )
}
