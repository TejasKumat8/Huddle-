import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHuddleById, clearCurrentHuddle } from "../store/huddleSlice";
import HuddleBoard from "../components/HuddleBoard";

export default function HuddleDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, actionStatus, error } = useSelector((state) => state.huddles);

  useEffect(() => {
    dispatch(fetchHuddleById(id));
    return () => dispatch(clearCurrentHuddle());
  }, [dispatch, id]);

  if (!current && actionStatus !== "failed") {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-center text-paper/50">Loading huddle…</p>;
  }
  if (!current && error) {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-center text-coral">{error}</p>;
  }

  return <HuddleBoard huddle={current} />;
}
