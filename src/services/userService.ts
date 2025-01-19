import { trpc } from '@/utils/trpc'
import { type User, type CreateUserInput, type UpdateUserInput } from '@/types/user'

export const userService = {
  getCurrentUser: () => {
    return trpc.user.me.useQuery()
  },

  updateProfile: (input: UpdateUserInput) => {
    return trpc.user.update.useMutation()
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }

    return response.json()
  },
}
