"use client"

import * as React from "react"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Grid } from "@visx/grid"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear } from "@visx/scale"
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip"
import { localPoint } from "@visx/event"

import { cn } from "@/lib/utils"

const tooltipStyles = {
  ...defaultStyles,
  background: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))",
  zIndex: 40,
}

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[]
  x: (d: any) => string | number
  y: (d: any) => number
  yLabel?: string
  xLabel?: string
  height?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
}

export function Chart({
  data,
  x,
  y,
  yLabel,
  xLabel,
  height: _height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 40,
  marginLeft = 40,
  className,
  ...props
}: ChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const width = React.useMemo(() => {
    return svgRef.current ? svgRef.current.clientWidth : 0
  }, [svgRef])
  const height = _height - marginTop - marginBottom
  const innerWidth = width - marginLeft - marginRight

  const xScale = React.useMemo(
    () =>
      scaleBand({
        range: [marginLeft, width - marginRight],
        domain: data.map(x),
        padding: 0.2,
      }),
    [data, width, marginLeft, marginRight, x],
  )
  const yScale = React.useMemo(
    () =>
      scaleLinear({
        range: [height + marginTop, marginTop],
        domain: [0, Math.max(...data.map(y))],
      }),
    [data, height, marginTop, y],
  )

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()

  const { TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<SVGRectElement>, d: any) => {
      const coords = localPoint((event.target as SVGElement).ownerSVGElement!, event)
      showTooltip({
        tooltipLeft: coords!.x,
        tooltipTop: coords!.y,
        tooltipData: d,
      })
    },
    [showTooltip],
  )

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <svg ref={svgRef} width="100%" height={_height}>
        <Group>
          {data.map((d, i) => {
            const xValue = x(d)
            const barWidth = xScale.bandwidth()
            const barHeight = height - (yScale(y(d)) ?? 0) + marginTop
            const barX = xScale(xValue)
            const barY = height - barHeight + marginTop

            return (
              <Group key={`bar-${xValue}`}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="currentColor"
                  className="text-primary"
                  onMouseOver={(event) => handleMouseOver(event, d)}
                  onMouseOut={hideTooltip}
                />
              </Group>
            )
          })}
        </Group>
        <AxisLeft
          hideAxisLine
          hideTicks
          scale={yScale}
          tickFormat={(value) => `${value}`}
          tickLabelProps={{
            fill: "hsl(var(--foreground))",
            fontSize: 12,
            textAnchor: "end",
            dy: "0.33em",
            dx: -4,
          }}
          top={marginTop}
          left={marginLeft}
        />
        <AxisBottom
          hideAxisLine
          hideTicks
          scale={xScale}
          tickFormat={(value) => `${value}`}
          tickLabelProps={{
            fill: "hsl(var(--foreground))",
            fontSize: 12,
            textAnchor: "middle",
          }}
          top={height + marginTop}
        />
        <Grid
          xScale={xScale}
          yScale={yScale}
          width={innerWidth}
          height={height}
          left={marginLeft}
          top={marginTop}
          strokeDasharray="1,3"
          className="stroke-muted"
        />
      </svg>
      {yLabel && (
        <div
          className="absolute left-0 transform -translate-x-1/2 -translate-y-1/2 top-1/2"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          {yLabel}
        </div>
      )}
      {xLabel && <div className="text-center mt-4">{xLabel}</div>}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div className="text-sm">
            <strong>{x(tooltipData)}</strong>
            <div>{y(tooltipData)}</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  )
}

export const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-4", className)} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("bg-background border rounded-md shadow-md p-2", className)} {...props} />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm", className)} {...props} />,
)
ChartTooltipContent.displayName = "ChartTooltipContent"

