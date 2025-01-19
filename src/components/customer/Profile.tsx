import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useNotification } from '@/hooks/useNotification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  avatar_url: z.string().optional(),
})

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export default function Profile() {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return {
        full_name: user?.user_metadata?.full_name || '',
        avatar_url: user?.user_metadata?.avatar_url || '',
      }
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          avatar_url: data.avatar_url,
        },
      })

      if (error) throw error

      showNotification({
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success',
      })

      router.refresh()
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message || 'Failed to update profile',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      form.setValue('avatar_url', publicUrl)
      
      showNotification({
        title: 'Success',
        message: 'Avatar uploaded successfully',
        type: 'success',
      })
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message || 'Failed to upload avatar',
        type: 'error',
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      {field.value && (
                        <img
                          src={field.value}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
