import { Client, Status, PlaceDetailsResponse, PlaceAutocompleteResponse, DirectionsResponse } from '@googlemaps/google-maps-services-js'

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

export interface DirectionsResult {
  distance: string
  duration: string
  steps: {
    instruction: string
    distance: string
    duration: string
  }[]
  polyline: string
}

export interface AutocompleteResult {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export class MapManager {
  private client: Client
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!this.apiKey) {
      throw new Error('Google Maps API key is required')
    }
    this.client = new Client({})
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
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'opening_hours',
            'photos',
            'rating',
            'types'
          ]
        }
      })

      const result = response.data.result
      if (!result) throw new Error('No place details found')

      const details: PlaceDetails = {
        placeId,
        name: result.name || '',
        address: result.formatted_address || '',
        location: {
          latitude: result.geometry?.location.lat || 0,
          longitude: result.geometry?.location.lng || 0
        }
      }

      if (result.opening_hours) {
        details.openingHours = {
          periods: result.opening_hours.periods.map(period => ({
            open: {
              day: period.open.day,
              time: period.open.time
            },
            close: {
              day: period.close.day,
              time: period.close.time
            }
          })),
          weekdayText: result.opening_hours.weekday_text
        }
      }

      if (result.photos) {
        details.photos = result.photos.map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        )
      }

      if (result.rating) {
        details.rating = result.rating
      }

      if (result.types) {
        details.types = result.types
      }

      return details
    } catch (error) {
      console.error('Error fetching place details:', error)
      throw error
    }
  }

  async getDirections(
    origin: string | Coordinates,
    destination: string | Coordinates,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DirectionsResult> {
    try {
      const response = await this.client.directions({
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

      const route = response.data.routes[0]
      if (!route) throw new Error('No route found')

      const leg = route.legs[0]
      if (!leg) throw new Error('No route leg found')

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text
        })),
        polyline: route.overview_polyline.points
      }
    } catch (error) {
      console.error('Error fetching directions:', error)
      throw error
    }
  }

  async getPlacesNearby(
    location: Coordinates,
    radius: number,
    type?: string,
    keyword?: string
  ): Promise<PlaceDetails[]> {
    try {
      const response = await this.client.placesNearby({
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
  ): Promise<AutocompleteResult[]> {
    try {
      const response = await this.client.placeAutocomplete({
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

      return response.data.predictions.map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text
      }))
    } catch (error) {
      console.error('Error autocompleting address:', error)
      throw error
    }
  }

  async getPlaceAutocomplete(
    input: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<AutocompleteResult[]> {
    try {
      const response = await this.client.placeAutocomplete({
        params: {
          input,
          key: this.apiKey,
          location: location ? `${location.lat},${location.lng}` : undefined,
          radius,
          types: ['establishment', 'geocode']
        }
      })

      return response.data.predictions.map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text
      }))
    } catch (error) {
      console.error('Error fetching place autocomplete:', error)
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
