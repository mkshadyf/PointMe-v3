import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR, { mutate } from 'swr'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/useToast'
import { businessService } from '@/services/businessService'
import { type Business, type UpdateBusinessInput } from '@/types/business'
import { useAuth } from '@/hooks/useAuth'

interface BusinessProfileProps {
  business: Business;
}

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  socialMedia: z.object({
    facebook: z.string().url('Invalid Facebook URL').optional(),
    instagram: z.string().url('Invalid Instagram URL').optional(),
    twitter: z.string().url('Invalid Twitter URL').optional(),
  }).optional(),
})

type BusinessFormData = z.infer<typeof businessSchema>

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
}

export default function BusinessProfile({ business }: BusinessProfileProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedLocation, setSelectedLocation] = useState(business?.location || defaultCenter)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || '',
      description: business?.description || '',
      address: business?.address || '',
      phone: business?.phone || '',
      email: business?.email || '',
      website: business?.website || '',
      location: business?.location || defaultCenter,
      socialMedia: business?.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: '',
      },
    },
  })

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user?.id) {
      setImageFile(file)
      try {
        const formData = new FormData()
        formData.append('image', file)
        await businessService.updateBusinessImage(user.id, { logoUrl: URL.createObjectURL(file) })
        mutate(['business', user.id])
        toast({
          title: 'Image uploaded',
          description: 'Business image has been updated successfully.',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload image.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedLocation({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      })
    }
  }

  const onSubmit = async (data: BusinessFormData) => {
    if (!user?.id) return;

    try {
      const updateData: UpdateBusinessInput = {
        ...data,
        location: selectedLocation,
      }

      await businessService.updateBusinessProfile(user.id, updateData)
      mutate(['business', user.id])
      toast({
        title: 'Profile updated',
        description: 'Your business profile has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Update your business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Business Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Location</FormLabel>
                  <div className="h-[300px]">
                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={selectedLocation}
                        zoom={13}
                        onClick={handleMapClick}
                      >
                        <Marker position={selectedLocation} />
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormLabel>Social Media</FormLabel>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="socialMedia.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMedia.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
