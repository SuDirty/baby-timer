import { useEffect } from 'react'
import TimeVisualizer from './TimeVisualizer'

function App() {
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${vh}px`)
    }
    
    setHeight()
    window.addEventListener('resize', setHeight)
    window.addEventListener('orientationchange', setHeight)
    
    return () => {
      window.removeEventListener('resize', setHeight)
      window.removeEventListener('orientationchange', setHeight)
    }
  }, [])

  return (
    <div className="w-full" style={{ height: 'var(--app-height)' }}>
      <TimeVisualizer />
    </div>
  )
}

export default App
