# Event Manager

A modern, full-stack event management application built with Next.js, TypeScript, Tailwind CSS, and Supabase. Create events, manage RSVPs, and connect with attendees seamlessly.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase Auth, including email verification to confirm user identity.
- **Event Management**: Create, view, and manage events with rich details
- **RSVP System**: Attendees can respond with Yes/No/Maybe status
- **Real-time Updates**: Live RSVP status updates
- **Responsive Design**: Modern UI that works on all devices
- **Row Level Security**: Secure data access with Supabase RLS policies
- **Type Safety**: Full TypeScript support for better development experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Custom component library
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Nitish-Biswas/event_manager
cd event_manager
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL dump provided in the project 
3. Update your environment variables with the project credentials

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following structure:

### Core Tables

- **users**: User profiles and authentication data
- **events**: Event details including title, description, date, and location
- **rsvps**: User responses to events (Yes/No/Maybe)

### Key Features

- **Row Level Security (RLS)**: Secure data access policies
- **Automatic Timestamps**: Created/updated timestamps for all records
- **Referential Integrity**: Foreign key constraints with cascade deletes
- **Performance Indexes**: Optimized queries for common operations

### Sample Data

The database includes sample users, events, and RSVPs to help you get started quickly.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── auth/           # Authentication pages
│   ├── events/         # Event-related pages
│   └── layout.tsx      # Root layout
├── components/          # Reusable UI components
│   ├── events/         # Event-specific components
│   └── ui/             # Generic UI components
├── lib/                 # Utility functions and configurations
│   └── supabase/       # Supabase client setup
└── types/               # TypeScript type definitions
```

## 🔐 Authentication

The app uses Supabase Auth with automatic user profile creation. When users sign up:

1. A new auth user is created
2. A corresponding profile is automatically added to the `users` table
3. Row Level Security policies ensure users can only access their own data

## 🎯 Key Components

- **EventCard**: Displays event information with RSVP options
- **RSVPButton**: Interactive RSVP status management
- **Navbar**: Navigation with authentication status
- **LoadingSpinner**: Loading states for better UX

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/event_manager/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

**You can also contact the developer:**

- **Name:** Nitish Biswas
- **Email:** nitishbiswas066@gmail.com

---

Built with ❤️ using Next.js and Supabase
