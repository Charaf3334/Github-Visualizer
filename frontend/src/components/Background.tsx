import React, { useEffect, useRef } from 'react'

interface Star 
{
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  opacity: number
}

const Background: React.FC = () => {
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) 
      return
    const ctx = canvas.getContext('2d')
    if (!ctx) 
      return
    let animationFrameId: number
    const generateStars = (width: number, height: number) => {
      return Array.from({length: 200}, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.2 + 0.2,
    }))
  }
    const resizeCanvas = (): void => {
      const prevWidth = canvas.width
      const prevHeight = canvas.height
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      starsRef.current.forEach((star) => {
        star.x = (star.x / prevWidth) * newWidth
        star.y = (star.y / prevHeight) * newHeight
    })
      canvas.width = newWidth
      canvas.height = newHeight
  }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    starsRef.current = generateStars(canvas.width, canvas.height)
    window.addEventListener('resize', resizeCanvas)
    const animate = (): void => {
      ctx.fillStyle = 'rgba(24, 23, 23, 2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      starsRef.current.forEach((star) => {
        star.x += star.vx
        star.y += star.vy
        if (star.x < 0) 
          star.x = canvas.width
        if (star.x > canvas.width) 
          star.x = 0
        if (star.y < 0) 
          star.y = canvas.height
        if (star.y > canvas.height) 
          star.y = 0
        star.opacity += (Math.random() - 0.5) * 0.02
        star.opacity = Math.max(0.2, Math.min(1, star.opacity))
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
    })
      animationFrameId = requestAnimationFrame(animate)
  }
    animate()
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
  }
}, [])

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}

export default Background