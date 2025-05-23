"use client"

import { useEffect, useRef } from "react"

export function ProcessFlowDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Define colors
    const equipmentColor = "#3b82f6"
    const streamColor = "#64748b"
    const textColor = "#1e293b"

    // Define positions
    const unitHeight = 60
    const unitWidth = 120
    const margin = 40
    const spacing = (canvas.width - 2 * margin - 3 * unitWidth) / 2

    // Draw equipment
    const drawEquipment = (x: number, y: number, width: number, height: number, label: string) => {
      ctx.fillStyle = equipmentColor
      ctx.strokeStyle = "#1e40af"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, 8)
      ctx.fill()
      ctx.stroke()

      // Add label
      ctx.fillStyle = "white"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(label, x + width / 2, y + height / 2)
    }

    // Draw stream
    const drawStream = (fromX: number, fromY: number, toX: number, toY: number, label?: string) => {
      ctx.strokeStyle = streamColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Add arrowhead
      const angle = Math.atan2(toY - fromY, toX - fromX)
      const arrowSize = 8
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - arrowSize * Math.cos(angle - Math.PI / 6), toY - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(toX - arrowSize * Math.cos(angle + Math.PI / 6), toY - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = streamColor
      ctx.fill()

      // Add label if provided
      if (label) {
        const midX = (fromX + toX) / 2
        const midY = (fromY + toY) / 2 - 10
        ctx.fillStyle = textColor
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(label, midX, midY)
      }
    }

    // Row 1
    const y1 = 50
    drawEquipment(margin, y1, unitWidth, unitHeight, "Feed Drum")
    drawEquipment(margin + unitWidth + spacing, y1, unitWidth, unitHeight, "Vaporizer")
    drawEquipment(margin + 2 * unitWidth + 2 * spacing, y1, unitWidth, unitHeight, "Heater")

    // Row 2
    const y2 = 180
    drawEquipment(margin, y2, unitWidth, unitHeight, "Reactor")
    drawEquipment(margin + unitWidth + spacing, y2, unitWidth, unitHeight, "Flash Unit")
    drawEquipment(margin + 2 * unitWidth + 2 * spacing, y2, unitWidth, unitHeight, "Scrubber")

    // Row 3
    const y3 = 310
    drawEquipment(margin + unitWidth / 2, y3, unitWidth, unitHeight, "Acetone Column")
    drawEquipment(margin + 2 * unitWidth + spacing, y3, unitWidth, unitHeight, "IPA Column")

    // Connect Row 1
    drawStream(margin + unitWidth, y1 + unitHeight / 2, margin + unitWidth + spacing, y1 + unitHeight / 2)
    drawStream(
      margin + 2 * unitWidth + spacing,
      y1 + unitHeight / 2,
      margin + 2 * unitWidth + 2 * spacing,
      y1 + unitHeight / 2,
    )

    // Connect Row 1 to Row 2
    drawStream(
      margin + 3 * unitWidth + 2 * spacing,
      y1 + unitHeight / 2,
      margin + 3 * unitWidth + 2 * spacing + 20,
      y1 + unitHeight / 2,
    )
    drawStream(
      margin + 3 * unitWidth + 2 * spacing + 20,
      y1 + unitHeight / 2,
      margin + 3 * unitWidth + 2 * spacing + 20,
      y1 + unitHeight + 20,
    )
    drawStream(margin + 3 * unitWidth + 2 * spacing + 20, y1 + unitHeight + 20, margin, y1 + unitHeight + 20)
    drawStream(margin, y1 + unitHeight + 20, margin, y2)

    // Connect Row 2
    drawStream(margin + unitWidth, y2 + unitHeight / 2, margin + unitWidth + spacing, y2 + unitHeight / 2)
    drawStream(
      margin + 2 * unitWidth + spacing,
      y2 + unitHeight / 2,
      margin + 2 * unitWidth + 2 * spacing,
      y2 + unitHeight / 2,
    )

    // Connect Row 2 to Row 3
    drawStream(
      margin + 3 * unitWidth + 2 * spacing,
      y2 + unitHeight / 2,
      margin + 3 * unitWidth + 2 * spacing + 20,
      y2 + unitHeight / 2,
    )
    drawStream(
      margin + 3 * unitWidth + 2 * spacing + 20,
      y2 + unitHeight / 2,
      margin + 3 * unitWidth + 2 * spacing + 20,
      y2 + unitHeight + 20,
    )
    drawStream(
      margin + 3 * unitWidth + 2 * spacing + 20,
      y2 + unitHeight + 20,
      margin + unitWidth / 2,
      y2 + unitHeight + 20,
    )
    drawStream(margin + unitWidth / 2, y2 + unitHeight + 20, margin + unitWidth / 2, y3)

    // Connect Columns
    drawStream(margin + (3 * unitWidth) / 2, y3 + unitHeight / 2, margin + 2 * unitWidth + spacing, y3 + unitHeight / 2)
  }, [])

  return (
    <div className="w-full h-[400px] bg-white border rounded-lg">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
