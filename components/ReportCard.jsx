import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

/**
 * Displays a single weekly Report document: the AI-written summary,
 * headline stats, and the weak-topics list for that period.
 */
export default function ReportCard({ report }) {
  const periodLabel = `${new Date(report.periodStart).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })} – ${new Date(report.periodEnd).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Week of {periodLabel}</CardTitle>
        <CardDescription>
          {report.quizzesTaken} quiz{report.quizzesTaken === 1 ? "" : "zes"} completed ·{" "}
          {report.averageScore}% average score
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed">{report.aiSummary}</p>

        {report.weakTopics?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {report.weakTopics.map((t, i) => (
              <Badge key={i} variant="destructive">
                {t.subject} · {t.topic} — {t.accuracy}%
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}