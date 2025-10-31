import React from 'react'
import './Spinner.css'

const Spinner: React.FC = () => {
  return (
    <div className="spinner-container">
      <div className="github-pixel">
        <div className="pixel-row">
          <div className="pixel"></div>
          <div className="pixel black"></div>
          <div className="pixel black"></div>
          <div className="pixel black"></div>
          <div className="pixel"></div>
        </div>
        <div className="pixel-row">
          <div className="pixel black"></div>
          <div className="pixel white"></div>
          <div className="pixel black"></div>
          <div className="pixel white"></div>
          <div className="pixel black"></div>
        </div>
        <div className="pixel-row">
          <div className="pixel black"></div>
          <div className="pixel black"></div>
          <div className="pixel black"></div>
          <div className="pixel black"></div>
          <div className="pixel black"></div>
        </div>
        <div className="pixel-row">
          <div className="pixel black"></div>
          <div className="pixel black"></div>
          <div className="pixel white"></div>
          <div className="pixel black"></div>
          <div className="pixel black"></div>
        </div>
        <div className="pixel-row">
          <div className="pixel"></div>
          <div className="pixel black"></div>
          <div className="pixel"></div>
          <div className="pixel black"></div>
          <div className="pixel"></div>
        </div>
      </div>
    </div>
  )
}

export default Spinner