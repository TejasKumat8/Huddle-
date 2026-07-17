import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../store/authSlice";
import Button from "../components/Button";
import Logo from "../components/Logo";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col justify-center px-6 py-16">
      <Link to="/" className="mb-8">
        <Logo light />
      </Link>
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-paper/60">
        You'll need this to organize huddles. Your friends won't — they just tap your link.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
            placeholder="Tejas Kumat"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
            placeholder="At least 6 characters"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>
        )}

        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-paper/60">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-gold hover:underline" onClick={() => dispatch(clearAuthError())}>
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-paper/80">{label}</span>
      {children}
    </label>
  );
}
