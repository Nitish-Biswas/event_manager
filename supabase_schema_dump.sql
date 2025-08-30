
-- CUSTOM TYPES
CREATE TYPE rsvp_status AS ENUM ('Yes', 'No', 'Maybe');



-- TABLE DEFINITIONS

-- USERS Table: Stores user profile information.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS Table: Stores event details.
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensures events are created for a future date.
    CONSTRAINT event_date_must_be_in_future CHECK (date > NOW())
);

-- RSVPS Table: The linking table for users and events.
CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status rsvp_status NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensures a user can only RSVP once to any given event.
    CONSTRAINT unique_user_event_rsvp UNIQUE (user_id, event_id)
);



-- 3. INDEXES FOR PERFORMANCE

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);


-- TRIGGERS AND FUNCTIONS
-- This function automatically updates the 'updated_at' timestamp whenever an RSVP record is modified.

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attaching the trigger to the rsvps table.
CREATE TRIGGER on_rsvp_update
    BEFORE UPDATE ON rsvps
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();


-- Function to insert into users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 5. ROW LEVEL SECURITY (RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR 'users' TABLE
CREATE POLICY "Users can view all other users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- POLICIES FOR 'events' TABLE
CREATE POLICY "Anyone can view public events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Event creators can update their own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Event creators can delete their own events" ON events FOR DELETE USING (auth.uid() = created_by);

-- POLICIES FOR 'rsvps' TABLE
CREATE POLICY "Enable read access for all users" ON rsvps FOR SELECT USING (true);
CREATE POLICY "Event creators can view all RSVPs for their events" ON rsvps FOR SELECT USING ((SELECT created_by FROM events WHERE id = event_id) = auth.uid());
CREATE POLICY "Users can create their own RSVPs" ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own RSVPs" ON rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own RSVPs" ON rsvps FOR DELETE USING (auth.uid() = user_id);



-- 6. SAMPLE DATA INSERTION


-- Insert 10 sample users
INSERT INTO users (name, email) VALUES
    ('Aarav Sharma', 'aarav.s@example.com'),
    ('Priya Patel', 'priya.p@example.com'),
    ('Rohan Gupta', 'rohan.g@example.com'),
    ('Ananya Singh', 'ananya.s@example.com'),
    ('Vikram Reddy', 'vikram.r@example.com'),
    ('Neha Joshi', 'neha.j@example.com'),
    ('Arjun Kumar', 'arjun.k@example.com'),
    ('Sanya Mehta', 'sanya.m@example.com'),
    ('Rajesh Nair', 'rajesh.n@example.com'),
    ('Kavya Iyer', 'kavya.i@example.com');

-- Insert 5 sample events 
INSERT INTO events (title, description, date, city, created_by) VALUES
    ('Diwali Tech Conference 2025', 'Exploring innovation during the festival of lights.', '2025-10-20 09:00:00+00', 'Bangalore', (SELECT id FROM users WHERE email = 'aarav.s@example.com')),
    ('Bollywood Music Festival', 'A celebration of Indian cinema and music.', '2025-09-22 12:00:00+00', 'Mumbai', (SELECT id FROM users WHERE email = 'priya.p@example.com')),
    ('Indian Cuisine Expo', 'Savor flavors from across India.', '2025-11-10 11:00:00+00', 'Delhi', (SELECT id FROM users WHERE email = 'rohan.g@example.com')),
    ('Startup Summit India', 'Connecting entrepreneurs and investors.', '2025-12-01 18:00:00+00', 'Online', (SELECT id FROM users WHERE email = 'aarav.s@example.com')),
    ('Contemporary Art Exhibition', 'Showcasing modern Indian artists.', '2025-10-25 19:00:00+00', 'Kolkata', (SELECT id FROM users WHERE email = 'ananya.s@example.com'));

-- Insert 20 sample RSVPs
INSERT INTO rsvps (user_id, event_id, status) VALUES
    -- Diwali Tech Conference RSVPs
    ((SELECT id FROM users WHERE email = 'priya.p@example.com'), (SELECT id FROM events WHERE title = 'Diwali Tech Conference 2025'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'rohan.g@example.com'), (SELECT id FROM events WHERE title = 'Diwali Tech Conference 2025'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'ananya.s@example.com'), (SELECT id FROM events WHERE title = 'Diwali Tech Conference 2025'), 'Maybe'),
    ((SELECT id FROM users WHERE email = 'vikram.r@example.com'), (SELECT id FROM events WHERE title = 'Diwali Tech Conference 2025'), 'No'),

    -- Bollywood Music Festival RSVPs
    ((SELECT id FROM users WHERE email = 'aarav.s@example.com'), (SELECT id FROM events WHERE title = 'Bollywood Music Festival'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'rohan.g@example.com'), (SELECT id FROM events WHERE title = 'Bollywood Music Festival'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'neha.j@example.com'), (SELECT id FROM events WHERE title = 'Bollywood Music Festival'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'arjun.k@example.com'), (SELECT id FROM events WHERE title = 'Bollywood Music Festival'), 'Maybe'),

    -- Indian Cuisine Expo RSVPs
    ((SELECT id FROM users WHERE email = 'sanya.m@example.com'), (SELECT id FROM events WHERE title = 'Indian Cuisine Expo'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'rajesh.n@example.com'), (SELECT id FROM events WHERE title = 'Indian Cuisine Expo'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'kavya.i@example.com'), (SELECT id FROM events WHERE title = 'Indian Cuisine Expo'), 'Maybe'),
    ((SELECT id FROM users WHERE email = 'aarav.s@example.com'), (SELECT id FROM events WHERE title = 'Indian Cuisine Expo'), 'No'),

    -- Startup Summit India RSVPs
    ((SELECT id FROM users WHERE email = 'priya.p@example.com'), (SELECT id FROM events WHERE title = 'Startup Summit India'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'vikram.r@example.com'), (SELECT id FROM events WHERE title = 'Startup Summit India'), 'Maybe'),
    ((SELECT id FROM users WHERE email = 'neha.j@example.com'), (SELECT id FROM events WHERE title = 'Startup Summit India'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'arjun.k@example.com'), (SELECT id FROM events WHERE title = 'Startup Summit India'), 'No'),

    -- Contemporary Art Exhibition RSVPs
    ((SELECT id FROM users WHERE email = 'sanya.m@example.com'), (SELECT id FROM events WHERE title = 'Contemporary Art Exhibition'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'rajesh.n@example.com'), (SELECT id FROM events WHERE title = 'Contemporary Art Exhibition'), 'Yes'),
    ((SELECT id FROM users WHERE email = 'kavya.i@example.com'), (SELECT id FROM events WHERE title = 'Contemporary Art Exhibition'), 'Maybe'),
    ((SELECT id FROM users WHERE email = 'rohan.g@example.com'), (SELECT id FROM events WHERE title = 'Contemporary Art Exhibition'), 'Yes');


-- A view to easily see a summary of RSVPs for each event.
CREATE OR REPLACE VIEW event_rsvp_summary AS
SELECT
    e.id AS event_id,
    e.title,
    e.city,
    e.date,
    u.name AS organizer,
    COUNT(r.id) AS total_rsvps,
    COUNT(CASE WHEN r.status = 'Yes' THEN 1 END) AS confirmed_attendees,
    COUNT(CASE WHEN r.status = 'Maybe' THEN 1 END) AS maybe_attendees,
    COUNT(CASE WHEN r.status = 'No' THEN 1 END) AS declined_attendees
FROM events e
LEFT JOIN users u ON e.created_by = u.id
LEFT JOIN rsvps r ON e.id = r.event_id
GROUP BY e.id, u.name
ORDER BY e.date;

