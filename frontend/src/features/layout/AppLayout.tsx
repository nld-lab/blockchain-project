import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const logoClickCount = useRef(0);
  const logoResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (logoResetTimer.current) clearTimeout(logoResetTimer.current);
    };
  }, []);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    logoClickCount.current += 1;

    if (logoResetTimer.current) clearTimeout(logoResetTimer.current);
    logoResetTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 1200);

    if (logoClickCount.current === 3) {
      event.preventDefault();
      logoClickCount.current = 0;
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="relative z-20 border-b border-[#bcae98] bg-[#f7f1e7]/95 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-10 lg:px-14">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="font-heading text-4xl leading-none tracking-[0.02em] text-[#171512]"
          >
            V<span className="text-[#b87812]">O</span>TE
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1 text-sm sm:gap-x-2">
            <NavLink
              className={({ isActive }) =>
                `border-b-2 px-3 py-2 transition-colors ${
                  isActive
                    ? "border-[#b87812] text-[#171512]"
                    : "border-transparent text-[#5b5042] hover:border-[#bcae98] hover:text-[#171512]"
                }`
              }
              to="/"
              end
            >
              Accueil
            </NavLink>
            <NavLink className="border-b-2 border-transparent px-3 py-2 text-[#5b5042] transition-colors hover:border-[#bcae98] hover:text-[#171512]" to="/vote">
              Voter
            </NavLink>
            <NavLink className="border-b-2 border-transparent px-3 py-2 text-[#5b5042] transition-colors hover:border-[#bcae98] hover:text-[#171512]" to="/resultats">
              Résultats
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="min-h-screen">{children}</main>
      <footer className="border-t border-[#bcae98] bg-[#f7f1e7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-14">
          <div>
            <Link
              to="/"
              className="font-heading text-4xl leading-none tracking-[0.02em] text-[#171512]"
            >
              V<span className="text-[#b87812]">O</span>TE
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#5b5042]">
              Une plateforme de vote claire, protégée et vérifiable pour chaque
              participant.
            </p>
          </div>
          <div>
            <p className="ruled-label pb-2">Navigation</p>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm">
              <Link className="text-[#5b5042] hover:text-[#171512]" to="/vote">
                Participer à un vote
              </Link>
              <Link className="text-[#5b5042] hover:text-[#171512]" to="/resultats">
                Voir les résultats
              </Link>
              <Link className="text-[#5b5042] hover:text-[#171512]" to="/admin">
                Administration
              </Link>
            </nav>
          </div>
          <div>
            <p className="ruled-label pb-2">Votre confiance</p>
            <div className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#5b5042]">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#315d5c]" />
              <p>
                Vos informations personnelles ne sont pas inscrites sur la
                blockchain.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#bcae98]">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-xs text-[#5b5042] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
            <span>© {new Date().getFullYear()} VOTE</span>
            <span>Un registre public, des identités privées.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
