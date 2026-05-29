import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16 text-center">
      <MailCheck className="mb-6 h-16 w-16 text-fire" />
      <h1 className="text-3xl font-bold text-white mb-3">Check your inbox</h1>
      <p className="text-slate-400 max-w-sm leading-7 mb-6">
        We sent a magic link to your email. Click it to sign in — it expires in 10 minutes.
      </p>
      <p className="text-sm text-slate-500">
        Didn&apos;t get it? Check spam or{" "}
        <Link href="/login" className="text-fire underline underline-offset-2 hover:text-fire/80">
          try again
        </Link>
        .
      </p>
    </div>
  );
}
