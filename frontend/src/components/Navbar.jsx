import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import Logo from "./Logo";
import Button from "./Button";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to={user ? "/dashboard" : "/"}>
          <Logo light />
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-paper/80 hover:text-paper">
              My huddles
            </Link>
            <Link to="/create" className="text-sm font-medium text-paper/80 hover:text-paper">
              New huddle
            </Link>
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-ink"
              style={{ backgroundColor: user.avatarColor || "#FFC857" }}
              title={user.name}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button as={Link} to="/login" variant="ghost" size="sm">
              Log in
            </Button>
            <Button as={Link} to="/register" variant="primary" size="sm">
              Get started
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
