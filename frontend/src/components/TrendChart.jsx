import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

class ChartBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMsg: "" }
  }
  static getDerivedStateFromError(e) {
    return { hasError: true, errorMsg: e.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <p style={{ color: "#f87171", fontSize: "12px", padding: "1rem" }}>
          Chart error: {this.state.errorMsg}
        </p>
      )
    }
    return this.props.children
  }
}

function Chart({ years, counts }) {
  if (!years || !counts || years.length === 0) return null

  const data = years.map((y, i) => ({
    year: y,
    count: typeof counts[i] === "number" ? counts[i] : 0
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "#4a7a52" }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#4a7a52" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#111a15",
            border: "1px solid rgba(74,222,128,0.25)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e6ede8",
          }}
          labelStyle={{ color: "#4ade80", marginBottom: "4px" }}
          formatter={(value) => [value, "papers"]}
          cursor={{ stroke: "rgba(74,222,128,0.15)" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#4ade80"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#4ade80", stroke: "none" }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function TrendChart({ years, counts }) {
  return (
    <ChartBoundary>
      <Chart years={years} counts={counts} />
    </ChartBoundary>
  )
}