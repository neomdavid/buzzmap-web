'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { getBarangayFromCoordinates } from '@/lib/utils'
import { Spinner } from '../ui/spinner'

type MapModalProps = {
  coordinates: { lat: number; lng: number }
  setCoordinates: Dispatch<SetStateAction<{ lat: number; lng: number }>>
  setBarangay: Dispatch<SetStateAction<string>>
}

const MapModal = ({
  coordinates,
  setCoordinates,
  setBarangay,
}: MapModalProps) => {
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [outsideQC, setOutsideQC] = useState(false)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords
            setCoordinates({ lat: latitude, lng: longitude })
            setLoadingLocation(false)
          },
          () => {
            console.error('Unable to retrieve location')
            setLoadingLocation(false)
          }
        )
      } else {
        console.error('Geolocation is not supported')
        setLoadingLocation(false)
      }
    }

    getCurrentLocation()
  }, [setCoordinates])

  // Detect when coordinates change to check for Quezon City boundary
  useEffect(() => {
    const isWithinQuezonCity = (lat: number, lng: number) => {
      const qcBounds = {
        north: 14.7795,
        south: 14.5896,
        east: 121.1541,
        west: 121.0026,
      }

      return (
        lat >= qcBounds.south &&
        lat <= qcBounds.north &&
        lng >= qcBounds.west &&
        lng <= qcBounds.east
      )
    }

    const checkLocation = async () => {
      const withinQC = isWithinQuezonCity(coordinates.lat, coordinates.lng)
      setOutsideQC(!withinQC)

      if (withinQC) {
        const barangay = await getBarangayFromCoordinates(coordinates.lat, coordinates.lng)
        setBarangay(barangay)
      } else {
        setBarangay('')
      }
    }

    checkLocation()
  }, [coordinates, setBarangay])

  if (loadingLocation || !isLoaded) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='relative w-full h-[400px] rounded-lg overflow-hidden'>
      {outsideQC && (
        <div className='absolute z-10 top-4 left-4 bg-white border border-red-500 text-red-500 px-4 py-2 rounded-lg shadow-md'>
          The selected location is outside Quezon City.
        </div>
      )}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={coordinates}
        zoom={15}
        onClick={e =>
          setCoordinates({ lat: e.latLng!.lat(), lng: e.latLng!.lng() })
        }
      >
        <MarkerF
          position={coordinates}
          draggable={true}
          onDragEnd={e =>
            setCoordinates({ lat: e.latLng!.lat(), lng: e.latLng!.lng() })
          }
        />
      </GoogleMap>
    </div>
  )
}

export default MapModal
