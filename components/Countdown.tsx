'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

// Sales close June 1 — that's the real deadline for advertisers
const WORLD_CUP = new Date('2026-06-01T00:00:00').getTime()

const LABELS: Record<string, string> = {
  days: 'DÍAS',
  hours: 'HORAS',
  minutes: 'MIN',
  seconds: 'SEG',
}

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const dist = WORLD_CUP - Date.now()
      if (dist < 0) return
      setTime({
        days: Math.floor(dist / 86400000),
        hours: Math.floor((dist % 86400000) / 3600000),
        minutes: Math.floor((dist % 3600000) / 60000),
        seconds: Math.floor((dist % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-4 md:gap-12 justify-center mt-16">
      {(Object.entries(time) as [string, number][]).map(([label, value]) => (
        <div key={label} className="text-center">
          <motion.div
            key={value}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-4xl md:text-7xl font-display font-black italic text-white leading-none tabular-nums"
          >
            {String(value).padStart(2, '0')}
          </motion.div>
          <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold font-black mt-2">
            {LABELS[label]}
          </div>
        </div>
      ))}
    </div>
  )
}
