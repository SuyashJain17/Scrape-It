import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex flex-1 flex-col items-center justify-center p-4 text-center'>
        <h1 className='text-6xl font-bold text-primary mb-4'>404</h1>
        <h2 className='text-2xl font-semibold mb-4'>Page not found</h2>
        <p className='text-muted-foreground mb-8 max-w-md'>
          Don&apos;t worry, even the best data sometimes gets lost in the internet.
        </p>
        <div className='flex flex-col sm:flex-row justify-center gap-4'>
          <Link
            href="/"
            className='flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Dashboard
          </Link>
        </div>
      </main>
      <footer className='text-center py-4 text-sm text-muted-foreground'>
        If you believe this is an error, please contact our support team.
      </footer>
    </div>
  )
}

export default NotFound
