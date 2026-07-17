import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyHuddles } from "../store/huddleSlice";
import Button from "../components/Button";

const statusStyles = {
  voting: "bg-gold/15 text-gold",
  finalized: "bg-teal/15 text-teal",
  cancelled: "bg-white/10 text-paper/50",
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.huddles);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyHuddles());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-gold">your huddles</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Hey {user?.name?.split(" ")[0]} 👋
          </h1>
        </div>
        <Button as={Link} to="/create">
          + New huddle
        </Button>
      </div>

      {status === "loading" && (
        <p className="mt-10 text-paper/50">Loading your huddles…</p>
      )}

      {status !== "loading" && list.length === 0 && (
        <div className="mt-16 rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="font-display text-lg font-semibold text-paper/80">No huddles yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-paper/50">
            Start one and share the link — your friends can vote without even making an account.
          </p>
          <Button as={Link} to="/create" className="mt-6">
            Start your first huddle
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((h) => (
          <Link
            key={h._id}
            to={`/h/${h._id}`}
            className="group rounded-2xl border border-line bg-ink-soft p-5 transition-colors hover:border-gold/50"
          >
            <div className="flex items-start justify-between">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[h.status]}`}>
                {h.status}
              </span>
              <span className="font-mono text-[11px] text-paper/30">#{h.inviteCode}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-gold">
              {h.title}
            </h3>
            <p className="mt-2 text-sm text-paper/50">
              {h.participants?.length || 0} {h.participants?.length === 1 ? "person" : "people"} ·{" "}
              {h.dateOptions?.length || 0} date{h.dateOptions?.length === 1 ? "" : "s"} proposed
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
