import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const integrationSchema = z.object({
  googleCalendar: z.object({
    enabled: z.boolean(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }),
  stripe: z.object({
    enabled: z.boolean(),
    publishableKey: z.string().optional(),
    secretKey: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
  twilio: z.object({
    enabled: z.boolean(),
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  mailchimp: z.object({
    enabled: z.boolean(),
    apiKey: z.string().optional(),
    listId: z.string().optional(),
  }),
})

export type IntegrationSettings = z.infer<typeof integrationSchema>

class IntegrationService {
  async getSettings(): Promise<IntegrationSettings> {
    const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .single()

    if (error) throw error

    return data || {
      googleCalendar: { enabled: false },
      stripe: { enabled: false },
      twilio: { enabled: false },
      mailchimp: { enabled: false },
    }
  }

  async updateSettings(settings: IntegrationSettings): Promise<void> {
    const { error } = await supabase
      .from('integration_settings')
      .upsert(settings)

    if (error) throw error
  }

  async testConnection(integration: keyof IntegrationSettings): Promise<boolean> {
    // Implement connection testing logic for each integration
    try {
      switch (integration) {
        case 'googleCalendar':
          // Test Google Calendar API connection
          return true
        case 'stripe':
          // Test Stripe API connection
          return true
        case 'twilio':
          // Test Twilio API connection
          return true
        case 'mailchimp':
          // Test Mailchimp API connection
          return true
        default:
          return false
      }
    } catch (error) {
      console.error(`Failed to test ${integration} connection:`, error)
      return false
    }
  }
}

export const integrationService = new IntegrationService()
