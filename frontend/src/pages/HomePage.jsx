import { SignedIn, UserButton } from '@clerk/clerk-react'
import React from 'react'

function HomePage() {
  return (
    <div>
        <SignedIn>
            <UserButton/>
        </SignedIn>
    </div>
  )
}

export default HomePage