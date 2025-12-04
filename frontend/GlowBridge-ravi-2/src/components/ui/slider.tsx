"use client"

import * as React from "react"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}: SliderProps) {
  const [minValue, maxValue] = value

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxValue - step)
    onValueChange([newMin, maxValue])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minValue + step)
    onValueChange([minValue, newMax])
  }

  return (
    <div className={`relative w-full h-8 ${className}`}>
      {}
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded transform -translate-y-1/2" />

      {}
      <div
        className="absolute top-1/2 h-2 bg-blue-500 rounded transform -translate-y-1/2"
        style={{
          left: `${((minValue - min) / (max - min)) * 100}%`,
          right: `${100 - ((maxValue - min) / (max - min)) * 100}%`,
        }}
      />

      {}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-auto accent-blue-500"
      />

      {}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-auto accent-blue-500"
      />
    </div>
  )
}
