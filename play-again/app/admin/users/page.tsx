"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import UserFilterSection from "./components/UserFilterSection";
import UserTable, { type UserAdmin } from "./components/UserTable";
import UserDetailDrawer from "./components/UserDetailDrawer";

export default function UsersAdminPage() {
  // --- ÉTATS ---
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCertified, setFilterCertified] = useState("");
  const [filterHasProducts, setFilterHasProducts] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- CHARGEMENT DES UTILISATEURS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (filterRole) queryParams.append("role", filterRole);
      if (filterStatus) queryParams.append("status", filterStatus);
      if (filterCertified) queryParams.append("certified", filterCertified);
      if (filterHasProducts) queryParams.append("hasProducts", filterHasProducts);
      if (sortBy) queryParams.append("sortBy", sortBy);

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Petit delai de debounce pour éviter d'inonder le serveur pendant la saisie
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, filterRole, filterStatus, filterCertified, filterHasProducts, sortBy]);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleToggleActive = async (userId: number, currentActiveState: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          is_active: !currentActiveState,
        }),
      });
      const data = await res.json();

      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      // Mise à jour de l'état local
      const updatedUsers = users.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, is_active: !currentActiveState };
          if (selectedUser?.id === userId) {
            setSelectedUser(updated);
          }
          return updated;
        }
        return u;
      });
      setUsers(updatedUsers);
      showNotification("success", data.message);
    } catch (e) {
      console.error(e);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectUser = (user: UserAdmin) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      {/* 🔔 Toast de notifications */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Gestion des Utilisateurs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modérez les comptes d'utilisateurs, examinez leurs métriques et appliquez des sanctions (soft-delete).
        </p>
      </div>

      {/* 🔍 Barre de Recherche & Filtres Premium */}
      <UserFilterSection
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCertified={filterCertified}
        setFilterCertified={setFilterCertified}
        filterHasProducts={filterHasProducts}
        setFilterHasProducts={setFilterHasProducts}
      />

      {/* 📊 Tableau des utilisateurs */}
      <UserTable users={users} loading={loading} onSelectUser={handleSelectUser} />

      {/* 🚀 TIROIR LATÉRAL DÉROULANT (MODAL DRAWER) */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        actionLoading={actionLoading}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
