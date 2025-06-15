// Temporarily simplified version to debug the crash
export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 Momentum App - Debug Mode
        </h1>
        <div className="text-center">
          <p className="text-lg mb-4">App is running successfully!</p>
          <p className="text-sm text-gray-600">
            Environment: {process.env.NODE_ENV || 'development'}
          </p>
          <p className="text-sm text-gray-600">
            Database URL exists: {process.env.DATABASE_URL ? '✅ Yes' : '❌ No'}
          </p>
          <p className="text-sm text-gray-600">
            NextAuth Secret exists: {process.env.NEXTAUTH_SECRET ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </div>
    </div>
  )
}
