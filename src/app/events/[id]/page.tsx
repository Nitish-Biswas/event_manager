import { createClient } from '@/lib/supabase/server'
import { RSVPButton } from '@/components/events/RSVPButton'
import { Navbar } from '@/components/ui/Navbar'
import { formatDate } from '@/lib/utils'
import { Calendar, MapPin, User, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  // Fetch event details with organizer
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Fetch RSVP data
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select(`
      *,
      user:users(name, email)
    `)
    .eq('event_id', params.id)

  // Get current user's RSVP if they're logged in
  const currentUserRSVP = authUser 
    ? rsvps?.find(rsvp => rsvp.user_id === authUser.id)
    : undefined

  // Calculate RSVP counts
  const rsvpCounts = {
    yes: rsvps?.filter(r => r.status === 'Yes').length || 0,
    maybe: rsvps?.filter(r => r.status === 'Maybe').length || 0,
    no: rsvps?.filter(r => r.status === 'No').length || 0,
    total: rsvps?.length || 0,
  }

  // Get confirmed attendees (for display)
  const confirmedAttendees = rsvps?.filter(r => r.status === 'Yes') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to events
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{event.city}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>
                    Organized by{' '}
                    <span className="font-medium">{event.organizer?.name}</span>
                  </span>
                </div>
              </div>

              {event.description && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    About this event
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Attendees */}
            {confirmedAttendees.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Confirmed Attendees ({confirmedAttendees.length})
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {confirmedAttendees.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {rsvp.user?.name || 'Anonymous'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RSVP Section */}
          <div className="space-y-6">
            {/* RSVP Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Going</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {rsvpCounts.yes}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Maybe</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {rsvpCounts.maybe}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Can't go</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {rsvpCounts.no}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Total Responses
                    </span>
                    <span className="font-bold text-gray-900">
                      {rsvpCounts.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Form */}
            <div className="card">
              <RSVPButton
                eventId={event.id}
                userId={authUser?.id}
                currentRSVP={currentUserRSVP}
              />
              
              {!authUser && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Link
                      href="/auth/login"
                      className="font-medium underline hover:no-underline"
                    >
                      Sign in
                    </Link>{' '}
                    to RSVP to this event
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}