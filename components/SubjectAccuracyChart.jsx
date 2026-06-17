"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * Bar chart showing accuracy % per subject/topic. Bars color-coded:
 * red (<60%, weak), amber (60-79%), green (80%+).
 * Expects data: [{ subject, topic, accuracy }]
 */
export default function SubjectAccuracyChart({ data }) {
  const chartData = data.map((d) => ({
    name: `${d.subject}${d.topic ? ` · ${d.topic}` : ""}`,
    accuracy: d.accuracy,
  }));

  const getColor = (accuracy) => {
    if (accuracy < 60) return "#dc2626"; // destructive
    if (accuracy < 80) return "#fbbf24"; // accent
    return "#16a34a"; // success
  };

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No quiz activity yet — once a few quizzes are taken, progress shows up here.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40, 160)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e2f5" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
        <YAxis type="category" dataKey="name" width={140} fontSize={12} />
        <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={18}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.accuracy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}