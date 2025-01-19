import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/useToast'
import { integrationService, type IntegrationSettings } from '@/services/integrationService'

const integrationSchema = z.object({
  googleCalendar: z.object({
    enabled: z.boolean(),
    clientId: z.string().optional().or(z.literal('')),
    clientSecret: z.string().optional().or(z.literal('')),
  }).refine(
    (data) => !data.enabled || (data.clientId && data.clientSecret),
    { message: 'Client ID and Client Secret are required when enabled' }
  ),
  stripe: z.object({
    enabled: z.boolean(),
    publishableKey: z.string().optional().or(z.literal('')),
    secretKey: z.string().optional().or(z.literal('')),
    webhookSecret: z.string().optional().or(z.literal('')),
  }).refine(
    (data) => !data.enabled || (data.publishableKey && data.secretKey),
    { message: 'Publishable Key and Secret Key are required when enabled' }
  ),
  twilio: z.object({
    enabled: z.boolean(),
    accountSid: z.string().optional().or(z.literal('')),
    authToken: z.string().optional().or(z.literal('')),
    phoneNumber: z.string().optional().or(z.literal('')),
  }).refine(
    (data) => !data.enabled || (data.accountSid && data.authToken && data.phoneNumber),
    { message: 'Account SID, Auth Token, and Phone Number are required when enabled' }
  ),
  mailchimp: z.object({
    enabled: z.boolean(),
    apiKey: z.string().optional().or(z.literal('')),
    listId: z.string().optional().or(z.literal('')),
  }).refine(
    (data) => !data.enabled || (data.apiKey && data.listId),
    { message: 'API Key and List ID are required when enabled' }
  ),
})

type FormData = z.infer<typeof integrationSchema>

export default function IntegrationSettings() {
  const { toast } = useToast()
  const [showSecrets, setShowSecrets] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: settings, error, mutate } = useSWR<IntegrationSettings>(
    'integrationSettings',
    () => integrationService.getSettings()
  )

  const form = useForm<FormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      googleCalendar: { enabled: false },
      stripe: { enabled: false },
      twilio: { enabled: false },
      mailchimp: { enabled: false },
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      await integrationService.updateSettings(data)
      await mutate()
      toast({
        title: 'Settings updated',
        description: 'Integration settings have been updated successfully.',
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update integration settings.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!settings && !error) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load integration settings. Please try again.
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Sync appointments with Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="googleCalendar.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Google Calendar</FormLabel>
                    <FormDescription>
                      Automatically sync appointments with Google Calendar
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('googleCalendar.enabled') && (
              <>
                <FormField
                  control={form.control}
                  name="googleCalendar.clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="googleCalendar.clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe</CardTitle>
            <CardDescription>
              Process payments with Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="stripe.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Stripe</FormLabel>
                    <FormDescription>
                      Accept payments through Stripe
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('stripe.enabled') && (
              <>
                <FormField
                  control={form.control}
                  name="stripe.publishableKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publishable Key</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stripe.secretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stripe.webhookSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook Secret</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Twilio</CardTitle>
            <CardDescription>
              Send SMS notifications with Twilio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="twilio.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Twilio</FormLabel>
                    <FormDescription>
                      Send SMS notifications for appointments
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('twilio.enabled') && (
              <>
                <FormField
                  control={form.control}
                  name="twilio.accountSid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account SID</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twilio.authToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Token</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twilio.phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mailchimp</CardTitle>
            <CardDescription>
              Sync contacts with Mailchimp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mailchimp.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Mailchimp</FormLabel>
                    <FormDescription>
                      Automatically sync contacts with Mailchimp
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('mailchimp.enabled') && (
              <>
                <FormField
                  control={form.control}
                  name="mailchimp.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          type={showSecrets ? 'text' : 'password'}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mailchimp.listId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
