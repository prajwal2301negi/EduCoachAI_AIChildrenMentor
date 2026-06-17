"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Line chart showing average quiz score per week, oldest to newest.
 * Expects reports: [{ periodEnd, averageScore }] (typically sorted newest-first
 * from the API, so this component reverses it for chronological display).
 */
export default function WeeklyScoreTrendChart({ reports }) {
  const chartData = [...reports]
    .reverse()
    .map((r) => ({
      week: new Date(r.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      averageScore: r.averageScore,
    }));

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No weekly reports yet — the first one generates automatically after some quiz activity.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ left: 0, right: 16, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e2f5" />
        <XAxis dataKey="week" fontSize={12} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
        <Tooltip formatter={(value) => [`${value}%`, "Average score"]} />
        <Line
          type="monotone"
          dataKey="averageScore"
          stroke="#3730a3"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#3730a3" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}