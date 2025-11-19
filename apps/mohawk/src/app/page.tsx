import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Mohawk
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            AI-Powered Web Application Builder
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Build production-ready web applications using natural language.
            Powered by Claude AI and the Punk Framework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/builder"
            className="group p-8 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl"
          >
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Create New App
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start building a new application with AI assistance.
              Chat with Claude to generate your app in real-time.
            </p>
            <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-block">
              Get Started →
            </div>
          </Link>

          <div className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 opacity-75">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Browse Skills
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explore components from the GlyphCase library.
            </p>
            <div className="mt-4 text-gray-400 dark:text-gray-500 font-medium">
              Coming Soon
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">AI-Powered Chat</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Describe your app and watch Claude build it in real-time
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">👁️</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Live Preview</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See your application update instantly as schemas stream in
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">One-Click Deploy</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Deploy to Vercel, Cloudflare, or export as static files
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
