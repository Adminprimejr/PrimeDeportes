'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from 'motion/react'

interface StatCardProps {
  target: number
  label: string
  suffix?: string
  prefix?: string
  source?: string
}

export default function StatCard({ target, label, suffix = '', prefix = '', source }: StatCardProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let current = 0
    const increment = target / (1500 / 16)
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <div ref={ref} className="border-l-4 border-gold pl-6 py-4">
      <div className="text-5xl md:text-7xl font-display font-black italic text-white mb-1 tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-black text-gold uppercase tracking-widest opacity-60 mb-1">
        {label}
      </div>
      {source && (
        <div className="text-[10px] text-white/25 font-bold uppercase tracking-wider">
          {source}
        </div>
      )}
    </div>
  )
}
