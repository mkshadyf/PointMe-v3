import { createClient } from '@/utils/supabase/client'

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryAfter?: Date
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

interface SecurityState {
  loginAttempts: number
  lockoutUntil?: Date
  lastAttempt: Date
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const ATTEMPT_RESET_DURATION = 30 * 60 * 1000 // 30 minutes

class SecurityService {
  private supabase = createClient()

  private async getSecurityState(email: string): Promise<SecurityState | null> {
    const { data } = await this.supabase
      .from('security_states')
      .select()
      .eq('email', email)
      .single()

    return data
  }

  private async updateSecurityState(
    email: string,
    state: Partial<SecurityState>
  ): Promise<void> {
    await this.supabase
      .from('security_states')
      .upsert({
        email,
        ...state,
        updated_at: new Date().toISOString(),
      })
  }

  async checkLoginAttempts(email: string): Promise<void> {
    const state = await this.getSecurityState(email)

    if (!state) {
      await this.updateSecurityState(email, {
        loginAttempts: 1,
        lastAttempt: new Date(),
      })
      return
    }

    // Check if lockout is still active
    if (state.lockoutUntil && new Date() < new Date(state.lockoutUntil)) {
      throw new SecurityError(
        'Too many login attempts. Please try again later.',
        'RATE_LIMIT_EXCEEDED',
        new Date(state.lockoutUntil)
      )
    }

    // Check if we should reset attempts due to time elapsed
    const lastAttempt = new Date(state.lastAttempt)
    if (Date.now() - lastAttempt.getTime() > ATTEMPT_RESET_DURATION) {
      await this.updateSecurityState(email, {
        loginAttempts: 1,
        lastAttempt: new Date(),
        lockoutUntil: null,
      })
      return
    }

    // Increment attempts and check for lockout
    const attempts = state.loginAttempts + 1
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION)
      await this.updateSecurityState(email, {
        loginAttempts: attempts,
        lastAttempt: new Date(),
        lockoutUntil,
      })
      throw new SecurityError(
        'Too many login attempts. Please try again later.',
        'RATE_LIMIT_EXCEEDED',
        lockoutUntil
      )
    }

    await this.updateSecurityState(email, {
      loginAttempts: attempts,
      lastAttempt: new Date(),
    })
  }

  async recordSuccessfulLogin(email: string): Promise<void> {
    await this.updateSecurityState(email, {
      loginAttempts: 0,
      lastAttempt: new Date(),
      lockoutUntil: null,
    })
  }

  async recordPasswordChange(userId: string): Promise<void> {
    // Invalidate all sessions except current one
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session) return

    await this.supabase.rpc('invalidate_other_sessions', {
      current_session_id: session.id,
      user_id: userId,
    })
  }

  async trackDevice(userId: string, deviceInfo: any): Promise<void> {
    await this.supabase.from('user_devices').insert({
      user_id: userId,
      device_info: deviceInfo,
      last_used: new Date().toISOString(),
    })
  }
}

export const securityService = new SecurityService()
