import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    title: "Finds your weak spots",
    description:
      "Every quiz quietly tracks which topics need more practice, so study time goes where it actually helps.",
  },
  {
    title: "Explains things simply",
    description:
      "No jargon. Concepts are broken down in plain language until they click.",
  },
  {
    title: "Keeps parents in the loop",
    description:
      "A weekly progress report lands automatically — no need to ask your kid how school is going.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold text-primary">EduCoach AI</span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Every child deserves a personal tutor.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            EduCoach AI learns each student&apos;s weak topics, builds custom
            practice quizzes, explains concepts simply, and sends parents a
            weekly progress report — automatically.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Start free as a student</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">I&apos;m a parent</Link>
            </Button>
          </div>
        </section>

        <section className="px-6 pb-20 max-w-5xl mx-auto grid sm:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-muted-foreground border-t border-border">
        EduCoach AI — built for students, trusted by parents.
      </footer>
    </div>
  );
}
