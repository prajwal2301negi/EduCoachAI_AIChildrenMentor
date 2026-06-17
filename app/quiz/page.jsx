"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SUBJECTS } from "@/lib/constants";

export default function QuizPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <DashboardNav />
      <QuizFlow />
    </ProtectedRoute>
  );
}

function QuizFlow() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: SUBJECTS[0],
    topic: "",
    numQuestions: 10,
    difficulty: "medium",
  });
  const router = useRouter();

  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.startQuiz(form);
      setQuiz(res.data);
      setAnswers({});
      setResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, index) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = Object.entries(answers).map(
        ([questionId, selectedAnswerIndex]) => ({
          questionId,
          selectedAnswerIndex,
        }),
      );
      const res = await api.submitQuiz(quiz._id, payload);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Result view ----
  if (result) {
    return (
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Quiz complete!</CardTitle>
            <CardDescription>
              {quiz.subject} — {quiz.topic}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-6">
            <span className="text-5xl font-bold text-primary">
              {result.score}%
            </span>
            <p className="text-muted-foreground text-sm">
              {result.score >= 80
                ? "Excellent work!"
                : result.score >= 60
                  ? "Good progress — keep practicing."
                  : "This topic needs more practice. You've got this."}
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setQuiz(null);
                setResult(null);
              }}
            >
              Take another quiz
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // ---- Active quiz view ----
  if (quiz) {
    const allAnswered = quiz.questions.every(
      (q) => answers[q.question._id] !== undefined,
    );

    return (
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-xl font-bold mb-1">
          {quiz.subject} — {quiz.topic}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Answer all {quiz.questions.length} questions, then submit.
        </p>

        <div className="flex flex-col gap-5">
          {quiz.questions.map((q, idx) => (
            <Card key={q.question._id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {idx + 1}. {q.question.questionText}
                </CardTitle>
                {q.question.examRelevance && (
                  <CardDescription className="text-xs">
                    📌 {q.question.examRelevance}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                {q.question.options.map((opt, optIdx) => (
                  <button
                    type="button"
                    key={optIdx}
                    onClick={() => selectAnswer(q.question._id, optIdx)}
                    className={`text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                      answers[q.question._id] === optIdx
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="mt-6">
          <Button onClick={handleSubmit} disabled={!allAnswered || loading}>
            {loading ? "Submitting..." : "Submit quiz"}
          </Button>
        </div>
      </main>
    );
  }

  // ---- Start quiz form ----
  return (
    <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Start a quiz</CardTitle>
          <CardDescription>
            Choose a subject and topic to practice.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleStart}>

          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Subject</Label>
              <Select
                value={form.subject}
                onValueChange={(value) => setForm((f) => ({ ...f, subject: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="e.g. Fractions, French Revolution, Photosynthesis"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(value) => setForm((f) => ({ ...f, difficulty: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="numQuestions">Number of questions (up to 20)</Label>
              <Input
                id="numQuestions"
                type="number"
                min={1}
                max={20}
                value={form.numQuestions}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    numQuestions: Math.min(Number(e.target.value) || 1, 20),
                  }))
                }
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating exam-style questions..." : "Start quiz"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        First time on a new topic, our AI tutor writes fresh exam-style questions for
        you — it may take a few seconds. After that, they&apos;re saved for next time.
      </p>
    </main>
  );
}
