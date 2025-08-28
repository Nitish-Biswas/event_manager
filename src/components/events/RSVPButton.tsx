'use client'

import { createClient } from '@/lib/supabase/client'
import { getRSVPStatusStyles } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { RSVP } from '@/types/database'

interface RSVPButtonProps {
  eventId: string
  userId?: string
  currentRSVP?: RSVP
  onUpdate?: () => void
}

type RSVPStatus = 'Yes' | 'No' | 'Maybe'

export function RSVPButton({ eventId, userId, currentRSVP, onUpdate }: RSVPButtonProps) {
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | null>(
    currentRSVP?.status || null
  )
  const supabase = createClient()
  const router = useRouter()

  const handleRSVP = async (status: RSVPStatus) => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    
    try {
      if (currentRSVP) {
        // Update existing RSVP
        const { error } = await supabase
          .from('rsvps')
          .update({ 
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentRSVP.id)

        if (error) throw error
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('rsvps')
          .insert({
            user_id: userId,
            event_id: eventId,
            status
          })

        if (error) throw error
      }

      setSelectedStatus(status)
      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error('RSVP error:', error)
      alert('Failed to update RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions: Array<{
    status: RSVPStatus
    label: string
    icon: React.ReactNode
    description: string
  }> = [
    {
      status: 'Yes',
      label: 'Going',
      icon: <CheckCircle className="w-4 h-4" />,
      description: "I'll be there!"
    },
    {
      status: 'Maybe',
      label: 'Maybe',
      icon: <HelpCircle className="w-4 h-4" />,
      description: "I'm not sure yet"
    },
    {
      status: 'No',
      label: "Can't go",
      icon: <XCircle className="w-4 h-4" />,
      description: "I won't be able to attend"
    }
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Will you be attending?
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statusOptions.map(({ status, label, icon, description }) => (
          <button
            key={status}
            onClick={() => handleRSVP(status)}
            disabled={loading}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedStatus === status 
                ? getRSVPStatusStyles(status) + ' border-current' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
            `}
          >
            {loading && selectedStatus === status && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <span className="font-medium">{label}</span>
            </div>
            <p className="text-xs opacity-75">{description}</p>
          </button>
        ))}
      </div>

      {selectedStatus && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Your response: <span className="font-medium">"{selectedStatus}"</span>
            {currentRSVP && (
              <span className="text-xs text-gray-500 block mt-1">
                You can change this anytime before the event.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}