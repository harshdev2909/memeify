# Memeify

A feature-rich meme creator and sharing platform built with React, Tailwind CSS, and Supabase.

## Features

- Create custom memes with an interactive editor
- Browse, like, and comment on memes
- User authentication with email/password and GitHub
- Real-time updates
- User profiles
- Tag-based search
- Mobile-responsive design with dark/light mode

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: Zustand, React Hook Form
- **Routing**: React Router
- **Backend**: Supabase (Auth, Database, Storage)
- **Meme Editor**: React Konva
- **UI Components**: Custom components with Lucide icons

## Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Local Development

1. Clone the repository:

```sh
git clone https://github.com/harshdev2909/memeify.git
cd meme-generator
```

2. Install dependencies:

```sh
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up Supabase tables:

- Create a new Supabase project
- Navigate to the SQL editor
- Run the SQL from `supabase/migrations/create_tables.sql`
- Enable Email/Password authentication and GitHub OAuth in the Auth settings

5. Start the development server:

```sh
npm run dev
```

## Deployment

The app can be deployed easily to Vercel or Netlify. Make sure to set the environment variables in your hosting provider's dashboard.

## License

This project is open-source, feel free to use it for your own projects.

## Credits

Built by [Harsh Sharma](https://github.com/harshdev2909)