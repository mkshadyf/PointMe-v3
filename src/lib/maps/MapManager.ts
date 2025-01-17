import { Client, Status } from '@googlemaps/google-maps-services-js'

const client = new Client({})

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface PlaceDetails {
  placeId: string
  name: string
  address: string
  location: Coordinates
  photos?: string[]
  rating?: number
  types?: string[]
  openingHours?: {
    periods: {
      open: { day: number; time: string }
      close: { day: number; time: string }
    }[]
    weekdayText: string[]
  }
}

export interface GeocodingResult {
  address: string
  location: Coordinates
  placeId?: string
}

export class MapManager {
  private apiKey: string

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      throw new Error('Google Maps API key is required')
    }
    this.apiKey = apiKey
  }

  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      })

      if (response.data.status !== Status.OK || !response.data.results[0]) {
        throw new Error('Geocoding failed')
      }

      const result = response.data.results[0]
      return {
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      throw error
    }
  }

  async reverseGeocode(location: Coordinates): Promise<GeocodingResult> {
    try {
      const response = await client.reverseGeocode({
        params: {
          latlng: location,
          key: this.apiKey,
        },
      })

      if (response.data.status !== Status.OK || !response.data.results[0]) {
        throw new Error('Reverse geocoding failed')
      }

      const result = response.data.results[0]
      return {
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      throw error
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const response = await client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'photos',
            'rating',
            'types',
            'opening_hours',
          ],
          key: this.apiKey,
        },
      })

      if (response.data.status !== Status.OK || !response.data.result) {
        throw new Error('Failed to get place details')
      }

      const result = response.data.result
      return {
        placeId,
        name: result.name,
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        photos: result.photos?.map(
          (photo) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        ),
        rating: result.rating,
        types: result.types,
        openingHours: result.opening_hours
          ? {
              periods: result.opening_hours.periods,
              weekdayText: result.opening_hours.weekday_text,
            }
          : undefined,
      }
    } catch (error) {
      console.error('Error getting place details:', error)
      throw error
    }
  }

  async getDirections(
    origin: string | Coordinates,
    destination: string | Coordinates,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<{
    distance: string
    duration: string
    steps: Array<{
      instruction: string
      distance: string
      duration: string
    }>
  }> {
    try {
      const response = await client.directions({
        params: {
          origin:
            typeof origin === 'string'
              ? origin
              : `${origin.latitude},${origin.longitude}`,
          destination:
            typeof destination === 'string'
              ? destination
              : `${destination.latitude},${destination.longitude}`,
          mode,
          key: this.apiKey,
        },
      })

      if (response.data.status !== Status.OK || !response.data.routes[0]) {
        throw new Error('Failed to get directions')
      }

      const route = response.data.routes[0].legs[0]
      return {
        distance: route.distance.text,
        duration: route.duration.text,
        steps: route.steps.map((step) => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text,
        })),
      }
    } catch (error) {
      console.error('Error getting directions:', error)
      throw error
    }
  }

  async getPlacesNearby(
    location: Coordinates,
    radius: number,
    type?: string,
    keyword?: string
  ): Promise<Array<PlaceDetails>> {
    try {
      const response = await client.placesNearby({
        params: {
          location,
          radius,
          type,
          keyword,
          key: this.apiKey,
        },
      })

      if (response.data.status !== Status.OK) {
        throw new Error('Failed to get nearby places')
      }

      const places = await Promise.all(
        response.data.results.map((place) =>
          this.getPlaceDetails(place.place_id)
        )
      )

      return places
    } catch (error) {
      console.error('Error getting nearby places:', error)
      throw error
    }
  }

  async autocompleteAddress(
    input: string,
    sessionToken: string
  ): Promise<Array<{ description: string; placeId: string }>> {
    try {
      const response = await client.placeAutocomplete({
        params: {
          input,
          sessiontoken: sessionToken,
          types: ['address'],
          key: this.apiKey,
        },
      })

      if (response.data.status !== Status.OK) {
        throw new Error('Address autocomplete failed')
      }

      return response.data.predictions.map((prediction) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }))
    } catch (error) {
      console.error('Error autocompleting address:', error)
      throw error
    }
  }

  generateStaticMapUrl(
    markers: Array<{ location: Coordinates; label?: string }>,
    options: {
      width?: number
      height?: number
      zoom?: number
      center?: Coordinates
    } = {}
  ): string {
    const {
      width = 600,
      height = 400,
      zoom = 14,
      center = markers[0]?.location,
    } = options

    const markersParam = markers
      .map(
        (marker) =>
          `markers=label:${marker.label || ''}|${marker.location.latitude},${
            marker.location.longitude
          }`
      )
      .join('&')

    return `https://maps.googleapis.com/maps/api/staticmap?center=${
      center.latitude
    },${
      center.longitude
    }&zoom=${zoom}&size=${width}x${height}&${markersParam}&key=${this.apiKey}`
  }
}

export const mapManager = new MapManager()
