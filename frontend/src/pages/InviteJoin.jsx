import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHuddleByInviteCode, clearCurrentHuddle } from "../store/huddleSlice";
import HuddleBoard from "../components/HuddleBoard";
import Logo from "../components/Logo";

export default function InviteJoin() {
  const { code } = useParams();
  const dispatch = useDispatch();
  const { current, actionStatus, error } = useSelector((state) => state.huddles);

  useEffect(() => {
    dispatch(fetchHuddleByInviteCode(code));
    return () => dispatch(clearCurrentHuddle());
  }, [dispatch, code]);

  if (!current && actionStatus !== "failed") {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-center text-paper/50">Finding your huddle…</p>;
  }
  if (!current && error) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <Logo light className="mx-auto" />
        <p className="mt-8 font-display text-xl font-semibold">We couldn't find that huddle</p>
        <p className="mt-2 text-sm text-paper/50">
          Double check the invite link — codes are case-sensitive.
        </p>
      </div>
    );
  }

  return <HuddleBoard huddle={current} />;
}
