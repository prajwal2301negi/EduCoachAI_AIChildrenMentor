import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "EduCoach AI — Your Personal AI Tutor",
  description:
    "Personalized AI tutoring for students. Custom practice, simple explanations, and weekly progress reports for parents.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
