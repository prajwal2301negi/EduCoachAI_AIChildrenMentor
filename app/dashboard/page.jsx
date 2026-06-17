"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import SubjectAccuracyChart from "@/components/SubjectAccuracyChart";
import WeeklyScoreTrendChart from "@/components/WeeklyScoreTrendChart";
import ReportCard from "@/components/ReportCard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardNav />
      <DashboardBody />
    </ProtectedRoute>
  );
}

function DashboardBody() {
  const { user } = useAuth();
  return (
    <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name.split(" ")[0]} 👋</h1>
      {user.role === "student" ? <StudentDashboard /> : <ParentDashboard />}
    </main>
  );
}

function StudentDashboard() {
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadAll = async () => {
    try {
      const [progressRes, historyRes, reportsRes] = await Promise.all([
        api.getMyProgress(),
        api.getQuizHistory(),
        api.getMyReports(),
      ]);
      setProgress(progressRes.data);
      setHistory(historyRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [progressRes, historyRes, reportsRes] = await Promise.all([
          api.getMyProgress(),
          api.getQuizHistory(),
          api.getMyReports(),
        ]);
        if (isMounted) {
          setProgress(progressRes.data);
          setHistory(historyRes.data);
          setReports(reportsRes.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError("");
    try {
      await api.generateMyReportNow();
      const reportsRes = await api.getMyReports();
      setReports(reportsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      <p className="text-muted-foreground">
        Here&apos;s how your practice is going. Start a new quiz any time to keep improving.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Start a practice quiz</CardTitle>
          <CardDescription>
            Pick a subject and topic — up to 20 exam-style questions, generated for your grade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/quiz">Start a new quiz</Link>
          </Button>
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground text-sm">Loading your progress...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by subject &amp; topic</CardTitle>
            <CardDescription>
              Anything under 60% is flagged as a topic to focus on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubjectAccuracyChart data={progress.allProgress} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Score trend</CardTitle>
          <CardDescription>Your average quiz score, week over week.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyScoreTrendChart reports={reports} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Weekly reports</CardTitle>
            <CardDescription>
              Auto-generated every Sunday. Your parent can see these too, if linked.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleGenerateReport} disabled={generating}>
            {generating ? "Generating..." : "Generate now"}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reports yet — take a few quizzes, then generate your first one.
            </p>
          ) : (
            reports.map((r) => <ReportCard key={r._id} report={r} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quizzes taken yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.slice(0, 8).map((q) => (
                <li
                  key={q._id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="text-sm">
                    {q.subject} — {q.topic}
                  </span>
                  {q.status === "completed" ? (
                    <Badge variant={q.score >= 60 ? "success" : "destructive"}>
                      {q.score}%
                    </Badge>
                  ) : (
                    <Badge variant="secondary">In progress</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childProgress, setChildProgress] = useState(null);
  const [childReports, setChildReports] = useState([]);
  const [linkEmail, setLinkEmail] = useState("");
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      const res = await api.getMyChildren();
      setChildren(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await api.getMyChildren();
        if (isMounted) setChildren(res.data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setLinkError("");
    setLinkSuccess("");
    try {
      await api.linkChild(linkEmail);
      setLinkSuccess("Child linked successfully.");
      setLinkEmail("");
      loadChildren();
    } catch (err) {
      setLinkError(err.message);
    }
  };

  const viewChildProgress = async (childId) => {
    setSelectedChild(childId);
    setError("");
    try {
      const [progressRes, reportsRes] = await Promise.all([
        api.getChildProgress(childId),
        api.getChildReports(childId),
      ]);
      setChildProgress(progressRes.data);
      setChildReports(reportsRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      <p className="text-muted-foreground">
        Track your child&apos;s learning progress and weak topics, all in one place.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Link a child</CardTitle>
          <CardDescription>
            Enter your child&apos;s registered email to connect their account to yours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLink} className="flex gap-2">
            <input
              type="email"
              required
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="child@example.com"
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit">Link</Button>
          </form>
          {linkError && <p className="text-sm text-destructive mt-2">{linkError}</p>}
          {linkSuccess && <p className="text-sm text-success mt-2">{linkSuccess}</p>}
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground text-sm">Loading children...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Your children</CardTitle>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No children linked yet. Use the form above to connect one.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {children.map((child) => (
                <li
                  key={child._id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{child.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {child.grade ? `${child.grade} grade` : "Grade not set"}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => viewChildProgress(child._id)}>
                    View progress
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {selectedChild && childProgress && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{childProgress.student.name}&apos;s accuracy by topic</CardTitle>
              <CardDescription>Anything under 60% needs more practice.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectAccuracyChart data={childProgress.allProgress} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score trend</CardTitle>
              <CardDescription>Average quiz score, week over week.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyScoreTrendChart reports={childReports} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly reports</CardTitle>
              <CardDescription>
                Generated automatically every Sunday based on quiz activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {childReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reports yet for this child — they&apos;ll appear here once quizzes are
                  taken and the weekly report runs.
                </p>
              ) : (
                childReports.map((r) => <ReportCard key={r._id} report={r} />)
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
