import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/hooks/useNotification'
import { Icons } from '@/components/ui/icons'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/toast'

const AUTOSAVE_DELAY = 1000 // 1 second

const businessSetupSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().min(1, 'Business description is required'),
  address: z.string().min(1, 'Business address is required'),
  phone: z.string()
    .min(1, 'Business phone is required')
    .regex(/^\+?[\d\s-()]{10,}$/, 'Please enter a valid phone number'),
  website: z.string().url().optional(),
  logo: z.string().optional(),
})

type BusinessSetupInput = z.infer<typeof businessSetupSchema>

export function BusinessSetupForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const supabase = useSupabase()

  const form = useForm<BusinessSetupInput>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues: async () => {
      // Try to load saved draft
      if (user) {
        const { data: draft } = await supabase
          .from('business_drafts')
          .select('data')
          .eq('user_id', user.id)
          .single()

        if (draft?.data) {
          return draft.data as BusinessSetupInput
        }
      }

      // Try to load from session storage
      const saved = sessionStorage.getItem('businessSetupForm')
      if (saved) {
        return JSON.parse(saved)
      }

      return {
        name: '',
        description: '',
        address: '',
        phone: '',
        website: '',
        logo: '',
      }
    },
  })

  // Calculate form progress
  useEffect(() => {
    const values = form.getValues()
    const requiredFields = ['name', 'description', 'address', 'phone']
    const completedFields = requiredFields.filter(field => !!values[field])
    setProgress((completedFields.length / requiredFields.length) * 100)
  }, [form.watch()])

  // Form persistence
  useEffect(() => {
    const subscription = form.watch((value) => {
      setIsDirty(true)
      sessionStorage.setItem('businessSetupForm', JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Autosave
  useEffect(() => {
    if (!user || !isDirty) return

    const timeoutId = setTimeout(async () => {
      try {
        await supabase
          .from('business_drafts')
          .upsert({
            user_id: user.id,
            data: form.getValues(),
            updated_at: new Date().toISOString(),
          })
        setIsDirty(false)
      } catch (error) {
        console.error('Failed to autosave:', error)
      }
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [form.watch(), user, isDirty])

  // Handle browser back button
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `business-logos/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(filePath)

      form.setValue('logo', publicUrl)
      setIsDirty(true)
      
      showNotification('Logo uploaded successfully', 'success')
    } catch (error: any) {
      showNotification(error.message || 'Failed to upload logo', 'error')
    }
  }

  const onSubmit = async (data: BusinessSetupInput) => {
    if (!user) return

    try {
      setIsLoading(true)

      // Create the business
      const { error: businessError } = await supabase.from('businesses').insert({
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        website: data.website,
        logo_url: data.logo,
        user_id: user.id,
      })

      if (businessError) throw businessError

      // Clean up draft and session storage
      await supabase
        .from('business_drafts')
        .delete()
        .eq('user_id', user.id)
      
      sessionStorage.removeItem('businessSetupForm')
      setIsDirty(false)

      showNotification('Business setup completed successfully', 'success')

      router.push('/dashboard')
    } catch (error: any) {
      showNotification(error.message || 'Failed to set up business', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Setup Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

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

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} type="tel" placeholder="+1 (234) 567-8900" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Logo (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-4">
                  {field.value && (
                    <img
                      src={field.value}
                      alt="Business Logo"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isDirty && (
          <p className="text-sm text-muted-foreground italic">
            Draft saved automatically
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Complete Setup
        </Button>
      </form>
    </Form>
  )
}
