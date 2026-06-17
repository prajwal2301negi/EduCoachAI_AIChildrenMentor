"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardNav() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Link href="/dashboard" className="text-lg font-semibold text-primary">
        EduCoach AI
      </Link>
      <div className="flex items-center gap-3">
        {user && (
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
        )}
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user?.name}
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
