"use client";

import { useState, useEffect } from "react";
import {
  UserPlus, Search, Shield, BadgeCheck,
  Hash, MoreHorizontal,
  Users, CheckCircle2, XCircle, Clock,
  Pencil, Trash2
} from "lucide-react";
import RegisterUserModal from "@/components/Modal/ChildModal/RegisterUserModal";
import EditUserModal from "@/components/Modal/ChildModal/EditAccountModal";
import SummaryCards from "@/components/ui/SummaryCards";
import { useGetAllUsers, UsersProps2 } from "@/hooks/admin/useAdmin";
import { useDebounce } from "use-debounce";
import { useAuthRoles } from "@/hooks/useAuthRoles";
import Pagination from "@/components/Pagination";
import CardLabel from "@/components/ui/CardLabel";
import Button from "@/components/ui/Button";
import SweetAlert from "@/utils/SweetAlert";
import { useDeleteUser } from "@/hooks/useRegister";

// ── Types (adjust to match your actual hook types) ──────────────────────────

export type UserRecord = {
  user_id: number;
  name: string;
  username: string;
  role_name: string;
  title?: string | null;
  license_no?: string | null;
  ptr_no?: string | null;
  is_active: boolean;
  created_at: string;
};

const ROLE_META: Record<number, { role_name: string, color: string; bg: string }> = {
  1: { role_name: "ADMIN", color: "#c8102e", bg: "#eef1f9" },
  2: { role_name: "DOCTOR", color: "#065050", bg: "#e0f4f4" },
  3: { role_name: "MEDTECH", color: "#7c4dab", bg: "#f3eefb" },
  4: { role_name: "STAFF", color: "#92400e", bg: "#fffbeb" },
  5: { role_name: "CASHIER", color: "#0f2244", bg: "#fdf0f2" },
};


function RoleBadge({ role }: { role: number }) {
  const m = ROLE_META[role] ?? { role_name: "N/A", color: "#6b7da0", bg: "#f0f3fa" };
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.color }}>
      <Shield size={9} />
      {m.role_name ?? "N/A"}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
      style={active
        ? { background: "#e0f4f4", color: "#065050" }
        : { background: "#f1f5f9", color: "#475569" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: active ? "#0e7c7b" : "#94a3b8" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

type SortKey = keyof UserRecord;

// ── Main page ────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [sortKey, setSortKey] = useState<SortKey>("user_id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [selectedUser, setSelectedUser] = useState<UsersProps2 | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [totalEntries, setTotalEntries] = useState(0);

  const { mutateAsync: deleteUserMutation } = useDeleteUser();

  const { data: roles, } = useAuthRoles();

  const roleNames = Array.from(
    new Set(roles?.map((role) => role.role_name.trim().toUpperCase()) ?? [])
  );

  const {
    data: userResponse,
  } = useGetAllUsers({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    sort: `${sortKey}_${sortDir}`,
    role: roleFilter
  });

  const users = userResponse?.data;
  const pagination = userResponse?.pagination;

  const summaryItems = [
    {
      label: "Total Users",
      value: users?.length ?? 0,
      color: "#0f2244",
      bg: "#eef1f9",
      icon: Users,
    },
    {
      label: "Active",
      value:
        users?.filter(
          (u) => u.is_active
        ).length ?? 0,
      color: "#065050",
      bg: "#e0f4f4",
      icon: CheckCircle2,
    },
    {
      label: "Inactive",
      value:
        users?.filter(
          (u) => !u.is_active
        ).length ?? 0,
      color: "#c8102e",
      bg: "#fdf0f2",
      icon: XCircle,
    },
    {
      label: "Pending Approval",
      value: 0,
      color: "#92400e",
      bg: "#fffbeb",
      icon: Clock,
    },
  ];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(
        sortDir === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // TOTAL PAGES
  const totalPages =
    pagination?.totalPages ?? 1;

  // SYNC TOTAL ENTRIES
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalEntries(
      pagination?.total ?? 0
    );
  }, [pagination]);

  // START INDEX
  const calculateStartIndex = () => {
    return totalEntries === 0
      ? 0
      : (page - 1) * rowsPerPage + 1;
  };

  // END INDEX
  const calculateEndIndex = () => {
    return Math.min(
      page * rowsPerPage,
      totalEntries
    );
  };

  // const handleDelete = async (u: UsersProps2) => {

  //   const confirmed = await SweetAlert.confirmationAlert2(
  //     "Delete Request?",
  //     `This will permanently delete user #${u.user_id}. This cannot be undone.`
  //   );

  //   if (!confirmed) return;

  //   try {
  //     await deleteUserMutation(u.user_id);
  //     setSelectedUser(null);

  //   } catch (error) {
  //     SweetAlert.errorAlert("Failed to delete request.");
  //     console.error(error);
  //   }
  // }

  return (
    <>
      {/* ── Register modal ── */}
      {showRegister && (
        <RegisterUserModal
          onClose={() => setShowRegister(false)}
          onSuccess={() => setShowRegister(false)}
        />
      )}
      {/* ── Update Account modal ── */}
      {showEdit && selectedUser && (
        <EditUserModal
          user={selectedUser}
          role_id={selectedUser.role.role_id}
          onClose={() => setShowEdit(false)}
          onSuccess={() => setShowEdit(false)}
        />
      )}

      <div className="min-h-screen font-['DM_Sans'] relative"
        style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}>

        {/* ── Page header ── */}
        <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide mb-1">
              User Management
            </h1>
            <p className="text-black/60 text-sm">
              Manage system accounts and access roles
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #c8102e 0%, #a00d25 100%)",
              boxShadow: "0 4px 16px rgba(200,16,46,0.35)",
            }}
          >
            <UserPlus size={15} /> Add New User
          </button>
        </div>

        <div className="px-8 py-2 space-y-5">

          {/* ── Stats row ── */}
          <SummaryCards items={summaryItems}></SummaryCards>

          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.10), 0 8px 24px rgba(15,34,68,0.06)" }}>

            {/* ── Toolbar ── */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-4 flex-wrap"
              style={{ borderBottom: "1px solid #f0f3fa", background: "#f8f9fc" }}>
              <div>

                <CardLabel>Bills Queue</CardLabel>
                <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>
                  {totalEntries} bills total
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">

                {/* Rows per page */}
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                  className="px-3 py-2 text-xs rounded-xl outline-none"
                  style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45" }}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>

                {/* Search */}
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                  <input
                    type="text"
                    placeholder="Search patient, bill…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                    style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "190px" }}
                  />
                </div>

                <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid #dce3ef" }}>
                  {["ALL", ...roleNames].map((roleName) => (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => {
                        setRoleFilter(roleName);
                        setPage(1);
                      }}
                      className="px-3 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{
                        background: roleFilter === roleName ? "#0f2244" : "white",
                        color: roleFilter === roleName ? "white" : "#6b7da0",
                      }}
                    >
                      {roleName === "ALL"
                        ? "All Roles"
                        : roleName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: "#f7f8fc",
                        borderBottom: "1px solid #eef1f9",
                      }}
                    >
                      {[
                        { key: "user_id" as SortKey, label: "#" },
                        { key: "name" as SortKey, label: "Name" },
                        { key: "username" as SortKey, label: "Username" },
                        { key: "role_name" as SortKey, label: "Role" },
                        { key: "title" as SortKey, label: "Title" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: "#8a99b8", cursor: "pointer" }}
                          onClick={() => toggleSort(key)}
                        >
                          <span className="inline-flex items-center gap-1">
                            {label}

                            {sortKey === key && (
                              <span className="text-[10px]">
                                {sortDir === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </span>
                        </th>
                      ))}

                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: "#8a99b8" }}
                      >
                        Credentials
                      </th>

                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: "#8a99b8" }}
                      >
                        Status
                      </th>

                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: "#8a99b8" }}
                      >
                        Joined
                      </th>

                      <th
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: "#8a99b8" }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" >
                    {users?.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{ background: "#f0f3fa" }}>
                              <Users size={20} style={{ color: "#c0ccd8" }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>
                              No users found
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : users?.map((user) => (
                      <tr key={user.user_id}
                        className="group transition-colors hover:bg-[#f8f9fc]">

                        {/* ID */}
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: "#eef1f9", color: "#6b7da0" }}>
                            #{String(user.user_id).padStart(4, "0")}
                          </span>
                        </td>

                        {/* Name + avatar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)" }}>
                              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <span className="text-[13px] font-semibold" style={{ color: "#1a2a45" }}>
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-4 py-3.5">
                          <span className="text-[12px] font-mono" style={{ color: "#6b7da0" }}>
                            {user.username}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5 text-black">
                          <RoleBadge role={user.role.role_id} />
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3.5">
                          {user.title
                            ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                              style={{ background: "#f0f3fa", color: "#0f2244" }}>
                              <BadgeCheck size={10} /> {user.title}
                            </span>
                            : <span style={{ color: "#d0d8e8" }}>—</span>
                          }
                        </td>

                        {/* Credentials */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            {user.license_no
                              ? <span className="text-[11px] inline-flex items-center gap-1" style={{ color: "#6b7da0" }}>
                                License <Hash size={9} /> {user.license_no}
                              </span>
                              : <span className="text-[11px]" style={{ color: "#d0d8e8" }}>No license</span>
                            }
                            {user.ptr_no
                              ? <span className="text-[10.5px]" style={{ color: "#8a99b8" }}>
                                PTR: {user.ptr_no}
                              </span>
                              : null
                            }
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge active={user.is_active} />
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5">
                          <span className="text-[11.5px]" style={{ color: "#8a99b8" }}>
                            {new Date(user.created_at).toLocaleDateString("en-PH", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button variant="acceptRequest" icon={<Pencil size={20} />} className="!text-[10px] !px-2 !py-1 !rounded-lg"
                              onClick={() => { setShowEdit(true); setSelectedUser(user) }}>
                              Edit
                            </Button>
                            {/* <Button variant="deleteRequest" icon={<Trash2 size={20} />} className="!text-[10px] !px-2 !py-1 !rounded-lg"
                              onClick={() => handleDelete(user)}>
                              Delete
                            </Button> */}
                          </div>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalEntries={totalEntries}
                  calculateStartIndex={calculateStartIndex}
                  calculateEndIndex={calculateEndIndex}
                  setCurrentPage={setPage}
                />
              </div>
            </div>
          </div>
        </div>
      </ div>
    </>

  );
}
