import React from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, Cell
} from "recharts"

export default function AnalysisPanel({ data }) {
  if (!data) return null

  const { top_keywords, topics, sentiment_trend, total, with_abstracts } = data

  return (
    <div className="analysis-wrap">

      {/* HEADER */}
      <div className="analysis-header">
        <div className="analysis-meta">
          <span>{total} papers analysed</span>
          <span className="dot">·</span>
          <span>{with_abstracts} with abstracts</span>
        </div>
      </div>

      <div className="analysis-grid">

        {/* TOPIC CLUSTERS */}
        <div className="analysis-card wide">
          <div className="analysis-card-label">research topic clusters</div>
          <div className="topics-list">
            {topics.map((t, i) => (
              <div key={i} className="topic-row">
                <div className="topic-header">
                  <span className="topic-label">{t.label}</span>
                  <span className="topic-count">{t.count} mentions</span>
                </div>
                <div className="topic-bar-wrap">
                  <div
                    className="topic-bar-fill"
                    style={{
                      width: `${Math.min((t.count / topics[0].count) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="topic-keywords">
                  {t.keywords.map(k => (
                    <span key={k} className="topic-kw">{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP KEYWORDS */}
        <div className="analysis-card">
          <div className="analysis-card-label">top keywords</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={top_keywords.slice(0, 12)}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#4a7a52" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="word"
                tick={{ fontSize: 11, fill: "#6b8a72" }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  background: "#111a15",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e6ede8"
                }}
                formatter={(v) => [v, "mentions"]}
                cursor={{ fill: "rgba(74,222,128,0.05)" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {top_keywords.slice(0, 12).map((_, i) => (
                  <Cell
                    key={i}
                    fill={`rgba(74,222,128,${1 - i * 0.07})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SENTIMENT TREND */}
        <div className="analysis-card">
          <div className="analysis-card-label">research sentiment trend</div>
          <p className="analysis-card-sub">
            positive vs negative language ratio per year
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={sentiment_trend}
              margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: "#4a7a52" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#4a7a52" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111a15",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e6ede8"
                }}
                formatter={(v) => [v > 0 ? `+${v}` : v, "sentiment score"]}
                labelStyle={{ color: "#4ade80" }}
              />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#4ade80", stroke: "none" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}