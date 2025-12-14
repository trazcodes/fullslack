import { SignedOut, SignIn, SignInButton } from '@clerk/clerk-react'
import React from 'react'
import '../styles/auth.css'

function AuthPage() {
  return (
    <div className='auth-container'>
      <div className="auth-left">
        <div className="auth-hero">
          <div className="brand-container">
            <img src='/logo(1).png' alt='Fullslack' className='brand-logo'/>
            <span className='brand-name'>Fullslack</span>
          </div>

          <h1 className='hero-title'>Where work happens</h1>

          <p className='hero-subtitle'>
            Connect with your team instantly through secure, real time messaging. 
            Experience seamless collaboration with powerful features designed for modern teams.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className='feature-icon'>💬</span>
              <span>Real-time messaging</span>
            </div>
            <div className="feature-item">
              <span className='feature-icon'>🎥</span>
              <span>Video calls & meetings</span>
            </div>
            <div className="feature-item">
              <span className='feature-icon'>🔒</span>
              <span>Secure & private</span>
            </div>
            

          </div>

          <SignInButton mode='modal'>
            <button className='cta-button'>
              Get Started with Fullslack
              <span className='button-arrow'>→</span>
            </button>
          </SignInButton>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-image-container">
          <img src="/auth-i.png" alt="Team Collaboration" className='auth-image' />
        </div>
      </div>




    </div>
  )
}

export default AuthPage