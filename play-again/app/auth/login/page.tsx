"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered")) {
      setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      {/* Background Decor with Home Page Colors */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-[#7D38FF] blur-[140px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-[#C6FF34] blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-2xl shadow-2xl">
        <div className="text-center">
          <img 
            src="/images/logoPlayAgain.png" 
            alt="Play Again Logo" 
            className="mx-auto h-[80px] w-auto"
          />
          <p className="mt-4 text-sm text-gray-400">Heureux de vous revoir ! Connectez-vous.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-500/10 p-3 text-center text-sm text-green-500 border border-green-500/20">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-[#7D38FF]/50 focus:bg-white/10 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-gray-600 transition-all focus:border-[#7D38FF]/50 focus:bg-white/10 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center rounded-2xl bg-[#C6FF34] px-4 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Se connecter"}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-3 text-gray-500 font-medium tracking-widest">Ou continuer avec</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => signIn("yahoo")}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#410093]/20 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#410093]/40 hover:border-[#7D38FF]/50"
          >
            <span className="text-[#7D38FF] font-black text-xl italic leading-none">Y!</span>
            Yahoo
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="font-bold text-[#C6FF34] hover:brightness-110 transition-all underline-offset-4 hover:underline">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
