import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import Logo from "../components/Logo";

export default function Landing() {
  const { user } = useSelector((state) => state.auth);
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div>
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo light size="lg" />
        <div className="flex items-center gap-3">
          <Button as={Link} to="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button as={Link} to="/register" variant="primary" size="sm">
            Get started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-gold">
              no more 40-message group chats
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl">
              Pick a plan.
              <br />
              Not a fight.
            </h1>
            <p className="mt-6 max-w-md text-lg text-paper/70">
              Propose a hangout, drop in some dates and spots, share one link. Everyone votes,
              nobody has to sign up, and the plan locks itself in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button as={Link} to="/register" size="lg">
                Start a huddle — it's free
              </Button>
              <Button as={Link} to="/login" variant="outline" size="lg">
                I have an invite link
              </Button>
            </div>
          </div>

          {/* Signature ticket-stub visual */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="perforated overflow-hidden rounded-3xl bg-paper text-ink shadow-2xl shadow-black/40" style={{ "--perf-position": "62%" }}>
              <div className="flex">
                <div className="w-[62%] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Huddle #A7F3K2</p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-tight">
                    Diwali Weekend Trip 🎆
                  </h3>
                  <p className="mt-3 text-sm text-ink/60">Proposed by Tejas</p>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-paper-dim px-3 py-2 text-sm">
                      <span>Fri, Oct 30</span>
                      <span className="font-mono text-xs text-teal">7 votes</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm ring-1 ring-line-light">
                      <span>Sat, Oct 31</span>
                      <span className="font-mono text-xs text-ink/40">3 votes</span>
                    </div>
                  </div>
                </div>
                <div className="flex w-[38%] flex-col items-center justify-center gap-3 bg-paper-dim p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40 [writing-mode:vertical-rl]">
                    scan to join
                  </span>
                  <div className="grid grid-cols-4 gap-[3px]">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-[1px]"
                        style={{ background: [0, 3, 5, 6, 9, 10, 12, 15].includes(i) ? "#1B1130" : "transparent" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-3xl border-2 border-dashed border-line-light/30" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-ink-soft/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold md:text-3xl">How a huddle comes together</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step
              mark="propose"
              title="Drop a few options"
              body="Pick 2–3 dates and a couple of spots you're thinking. Takes about a minute."
            />
            <Step
              mark="share"
              title="Send one link"
              body="Friends tap in, vote, and RSVP — no account, no app download, no friction."
            />
            <Step
              mark="lock in"
              title="Plan finalizes itself"
              body="Once votes settle, lock in the winner. Everyone sees the final plan instantly."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Your friends are already arguing about this weekend.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-paper/70">
          Give them somewhere better to do it than a group chat.
        </p>
        <Button as={Link} to="/register" size="lg" className="mt-8">
          Start your first huddle
        </Button>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-paper/40">
        Built by Tejas Kumat · <a href="https://github.com/TejasKumat8" className="underline hover:text-paper/70">github.com/TejasKumat8</a>
      </footer>
    </div>
  );
}

function Step({ mark, title, body }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-coral">{mark}</p>
      <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-paper/60">{body}</p>
    </div>
  );
}
