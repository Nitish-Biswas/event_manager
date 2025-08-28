import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { Navbar } from '@/components/ui/Navbar'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { EventWithOrganizer } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch upcoming events with organizer information and RSVP counts
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users(name, email),
      rsvps(status)
    `)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
  }

  // Process events to add RSVP counts
  const eventsWithCounts: EventWithOrganizer[] = (events || []).map(event => ({
    ...event,
    organizer: event.organizer,
    rsvp_count: {
      total: event.rsvps.length,
      yes: event.rsvps.filter((r: any) => r.status === 'Yes').length,
      maybe: event.rsvps.filter((r: any) => r.status === 'Maybe').length,
      no: event.rsvps.filter((r: any) => r.status === 'No').length,
    }
  }))

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Discover Amazing Events in Your City
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Connect with your community through exciting events, workshops, and meetups. 
              RSVP with just a click and never miss out again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{events?.length || 0} upcoming events</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Multiple cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Join the community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-gray-600">
              Browse and RSVP to events that interest you
            </p>
          </div>

          {eventsWithCounts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No upcoming events
              </h3>
              <p className="text-gray-600">
                Check back later for new events in your area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsWithCounts.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Event Manager</h3>
            <p className="text-gray-400 mb-4">
              Connecting communities through amazing events
            </p>
            <p className="text-gray-500 text-sm">
              Built with Next.js and Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}