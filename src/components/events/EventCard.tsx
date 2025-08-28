import { Calendar, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { formatEventDate } from '@/lib/utils'
import type { EventWithOrganizer } from '@/types/database'

interface EventCardProps {
  event: EventWithOrganizer
}

export function EventCard({ event }: EventCardProps) {
  const { rsvp_count } = event

  return (
    <Link href={`/events/${event.id}`} className="group">
      <div className="card hover:shadow-md transition-shadow duration-200 group-hover:border-primary-200">
        {/* Event Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </div>
          
          {event.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {event.description}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{event.city}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <User className="w-4 h-4" />
            <span>Organized by {event.organizer?.name || 'Unknown'}</span>
          </div>
        </div>

        {/* RSVP Stats */}
        {rsvp_count && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                {rsvp_count.yes} Going
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                {rsvp_count.maybe} Maybe
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {rsvp_count.total} {rsvp_count.total === 1 ? 'Response' : 'Responses'}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}