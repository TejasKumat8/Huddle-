import { Link } from "react-router-dom";
import Button from "../components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-6xl font-bold text-line-light">404</p>
      <h1 className="mt-4 font-display text-xl font-semibold">This huddle wandered off</h1>
      <p className="mt-2 text-sm text-paper/50">The page you're looking for doesn't exist.</p>
      <Button as={Link} to="/" className="mt-6">
        Back home
      </Button>
    </div>
  );
}
