"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isAdmin } from "@/lib/roles";
import {
  getAdminUsers,
  setUserRole,
  activateUser,
  deactivateUser,
  sendUserPasswordReset,
  roleLabel,
  ROLES,
  type AdminUser,
} from "@/lib/usersAdmin";

function Manager() {
  const [list, setList] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  function reload(searchTerm: string) {
    setLoading(true);
    setError("");
    getAdminUsers({ search: searchTerm || undefined })
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function submitSearch(ev: React.FormEvent) {
    ev.preventDefault();
    setQuery(search.trim());
  }

  function patchLocal(id: number, changes: Partial<AdminUser>) {
    setList((rows) => rows.map((u) => (u.id === id ? { ...u, ...changes } : u)));
  }

  async function changeRole(u: AdminUser, role: string) {
    if (role === u.role) return;
    const prev = u.role;
    setBusyId(u.id);
    setError("");
    setNotice("");
    patchLocal(u.id, { role });
    try {
      await setUserRole(u.id, role);
      setNotice(`Updated ${u.email} to ${roleLabel(role)}.`);
    } catch (e) {
      patchLocal(u.id, { role: prev });
      setError(e instanceof Error ? e.message : "Could not change role");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(u: AdminUser) {
    setBusyId(u.id);
    setError("");
    setNotice("");
    try {
      if (u.is_active) await deactivateUser(u.id);
      else await activateUser(u.id);
      patchLocal(u.id, { is_active: !u.is_active });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status");
    } finally {
      setBusyId(null);
    }
  }

  async function sendReset(u: AdminUser) {
    setBusyId(u.id);
    setError("");
    setNotice("");
    try {
      await sendUserPasswordReset(u.id);
      setNotice(`Password reset link sent to ${u.email}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send reset link");
    } finally {
      setBusyId(null);
    }
  }

  const selectCls =
    "rounded-md border border-nal-border px-2 py-1.5 text-sm outline-none focus:border-nal-saffron";
  const btnCls =
    "min-h-[44px] rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy transition hover:bg-nal-parchment disabled:opacity-50";

  function StatusBadge({ active }: { active: boolean }) {
    return active ? (
      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        Active
      </span>
    ) : (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        Inactive
      </span>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">
        Users &amp; Roles
      </h1>
      <p className="mt-2 text-nal-slate">
        Search members, change their role, activate or deactivate accounts, and
        send password reset links.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      <form onSubmit={submitSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="min-h-[44px] flex-1 rounded-md border border-nal-border px-3 py-2 text-base outline-none focus:border-nal-saffron"
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-sm text-nal-slate">Loading…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-nal-border bg-white/50 p-6 text-sm text-nal-slate">
          No users found.
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="mt-8 space-y-4 md:hidden">
            {list.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl border border-nal-border bg-white p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-nal-navy">
                      {u.full_name || "—"}
                    </p>
                    <p className="truncate text-sm text-nal-slate">{u.email}</p>
                  </div>
                  <StatusBadge active={u.is_active} />
                </div>
                <div className="mt-3">
                  <label className="block text-xs text-nal-slate">Role</label>
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => changeRole(u, e.target.value)}
                    className={`mt-1 w-full ${selectCls}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={busyId === u.id}
                    className={btnCls}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => sendReset(u)}
                    disabled={busyId === u.id}
                    className={btnCls}
                  >
                    Send reset link
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-nal-border bg-nal-parchment/50 text-nal-slate">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nal-border">
                {list.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-nal-navy">
                        {u.full_name || "—"}
                      </p>
                      <p className="text-nal-slate">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={busyId === u.id}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className={selectCls}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={u.is_active} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={busyId === u.id}
                          className={btnCls}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => sendReset(u)}
                          disabled={busyId === u.id}
                          className={btnCls}
                        >
                          Send reset link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireRole allow={isAdmin}>
      <Manager />
    </RequireRole>
  );
}
