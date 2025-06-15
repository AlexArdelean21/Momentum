# 🔥 Momentum - Habit Tracker

A beautiful, modern habit tracking application built with Next.js 14, TypeScript, and Neon Database. Track your daily activities, build streaks, and maintain momentum in your personal growth journey.

## ✨ Features

- **Beautiful UI**: Modern, responsive design with smooth animations and gradient effects
- **Habit Tracking**: Create custom activities with emoji icons and descriptions
- **Streak Tracking**: Monitor current and best streaks for each activity
- **Daily Statistics**: View today's progress and active streaks
- **Real-time Updates**: Instant feedback with confetti effects and celebrations
- **Dark Mode**: Toggle between light and dark themes
- **Database Health**: Built-in database status monitoring
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Neon (PostgreSQL)
- **UI Components**: Radix UI, Lucide React Icons
- **State Management**: React Server Components & Actions
- **Deployment**: Vercel-ready

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Neon database account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/momentum.git
   cd momentum
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="your_neon_database_connection_string"
   NEXTAUTH_SECRET="your_nextauth_secret_key"
   ```

4. **Initialize the database**
   The app will automatically create the necessary tables and functions on first run.

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
momentum/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── activity-card.tsx  # Individual activity card
│   ├── add-activity-modal.tsx # Add new activity modal
│   ├── database-status.tsx    # Database health checker
│   ├── header.tsx        # App header
│   └── today-summary.tsx # Today's stats summary
├── lib/                  # Utility functions
│   ├── actions.ts        # Server actions
│   ├── database.ts       # Database operations
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── scripts/              # Database scripts
```

## 🎯 Key Features Explained

### Activity Management
- Create activities with custom names, emojis, and descriptions
- Delete activities with confirmation
- Real-time updates across all components

### Streak Tracking
- **Current Streak**: Days in a row you've completed the activity
- **Best Streak**: Your longest ever streak for this activity
- **Total Days**: Total number of days you've completed the activity

### Smart Database Functions
- PostgreSQL functions for efficient streak calculations
- Automatic database initialization
- Health monitoring and status reporting

### UI/UX Improvements
- **Single Add Button**: Streamlined interface with one "+" button
- **Improved Emoji Selection**: Better positioned emoji containers
- **Enhanced Visual Hierarchy**: Clearer typography and spacing
- **Responsive Design**: Works on all screen sizes
- **Animation Effects**: Smooth transitions and celebrations

## 🔧 Database Schema

The app uses PostgreSQL with the following tables:

### Activities Table
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) DEFAULT '🎯',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Activity Logs Table
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(activity_id, date)
);
```

## 🚀 Deployment

The app is ready for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Neon](https://neon.tech/)
- Icons by [Lucide](https://lucide.dev/)
- UI components by [Radix UI](https://www.radix-ui.com/)

---

**Start building momentum today! 🚀** 