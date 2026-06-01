"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ShieldAlert, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  UserMinus, 
  Mail, 
  Phone, 
  Calendar, 
  Loader2,
  ChevronDown,
  Shield,
  Activity,
  Award,
  ShoppingBag,
  ArrowUpDown,
  User,
  Check
} from "lucide-react";

interface UserAdmin {
  id: number;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string;
  phone: string | null;
  profile_picture: string | null;
  created_at: string;
  is_active: boolean;
  is_certified: boolean;
  role: string;
  _count: {
    products: number;
  };
}

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  // Fermer les dropdowns lors d'un clic extérieur
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

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
          is_active: !currentActiveState
        })
      });
      const data = await res.json();

      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      // Mise à jour de l'état local
      const updatedUsers = users.map(u => {
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

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      
      {/* 🔔 Toast de notifications en surbrillance */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Gestion des Utilisateurs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Modérez les comptes d'utilisateurs, examinez leurs métriques et appliquez des sanctions (soft-delete).
        </p>
      </div>

      {/* 🔍 Barre de Recherche & Filtres Premium */}
      <div className="flex flex-col gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg relative z-20">
        {/* Ligne 1 : Recherche & Tri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche textuelle */}
          <div className="md:col-span-2 relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, identifiant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent/50 transition-all font-medium shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Tri (SortBy) - Custom Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "sortBy" ? null : "sortBy")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "sortBy" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {sortBy === "date_desc" && "Tri : Plus récent"}
                  {sortBy === "date_asc" && "Tri : Plus ancien"}
                  {sortBy === "products_desc" && "Tri : Plus d'articles"}
                  {sortBy === "products_asc" && "Tri : Moins d'articles"}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "sortBy" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "sortBy" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "date_desc", label: "Date : Plus récent", icon: Calendar },
                    { value: "date_asc", label: "Date : Plus ancien", icon: Calendar },
                    { value: "products_desc", label: "Articles : Plus d'articles", icon: ShoppingBag },
                    { value: "products_asc", label: "Articles : Moins d'articles", icon: ShoppingBag }
                  ].map((option) => {
                    const isSelected = sortBy === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                          isSelected 
                            ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30" 
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ligne 2 : Filtres Multiples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dropdown Rôle */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "role" ? null : "role")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "role" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterRole === "" && "Rôle : Tous"}
                  {filterRole === "USER" && "Membres (USER)"}
                  {filterRole === "ADMIN" && "Admin (ADMIN)"}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "role" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "role" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Rôle : Tous", icon: User },
                    { value: "USER", label: "Membres (USER)", icon: UserCheck },
                    { value: "ADMIN", label: "Admin (ADMIN)", icon: ShieldAlert }
                  ].map((option) => {
                    const isSelected = filterRole === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterRole(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                          isSelected 
                            ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30" 
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Statut */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "status" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterStatus === "" && "Statut : Tous"}
                  {filterStatus === "active" && "Actifs"}
                  {filterStatus === "inactive" && "Suspendus"}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "status" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "status" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Statut : Tous", icon: Activity },
                    { value: "active", label: "Actifs uniquement", icon: UserCheck },
                    { value: "inactive", label: "Suspendus uniquement", icon: UserMinus }
                  ].map((option) => {
                    const isSelected = filterStatus === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                          isSelected 
                            ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30" 
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Certification */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "certified" ? null : "certified")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "certified" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterCertified === "" && "Certif : Toutes"}
                  {filterCertified === "true" && "Certifiés uniquement"}
                  {filterCertified === "false" && "Standard / Non-Certif"}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "certified" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "certified" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Toutes les confiances", icon: Award },
                    { value: "true", label: "Certifiés uniquement", icon: CheckCircle },
                    { value: "false", label: "Standard / Non-Certif", icon: AlertCircle }
                  ].map((option) => {
                    const isSelected = filterCertified === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterCertified(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                          isSelected 
                            ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30" 
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Ventes */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "hasProducts" ? null : "hasProducts")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "hasProducts" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterHasProducts === "" && "Activités : Toutes"}
                  {filterHasProducts === "true" && "Vendeurs uniquement"}
                  {filterHasProducts === "false" && "Acheteurs uniquement"}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "hasProducts" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "hasProducts" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Activités : Toutes", icon: ShoppingBag },
                    { value: "true", label: "Vendeurs uniquement", icon: ShoppingBag },
                    { value: "false", label: "Acheteurs uniquement", icon: User }
                  ].map((option) => {
                    const isSelected = filterHasProducts === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterHasProducts(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                          isSelected 
                            ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30" 
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📊 Tableau des utilisateurs */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Utilisateur</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Inscription</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Rôle</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Articles</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold">Chargement en cours...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <span className="text-xs text-slate-500 font-bold">Aucun utilisateur ne correspond à ces critères.</span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-white/[0.01] active:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    {/* Profil & Username */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {user.profile_picture ? (
                          <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            {(user.username || user.email).substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {user.username || "Sans pseudo"}
                          {user.is_certified && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Certifié" />
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {user.firstname || ""} {user.lastname || ""}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4">
                      <span className="text-xs font-mono font-medium text-slate-300">
                        {user.email}
                      </span>
                    </td>

                    {/* Date inscription */}
                    <td className="p-4">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </td>

                    {/* Rôle */}
                    <td className="p-4 text-center">
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        user.role === "ADMIN" 
                          ? "bg-red-500/10 border-red-500/20 text-red-400" 
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Nombre d'articles */}
                    <td className="p-4 text-center">
                      <span className="text-xs font-bold text-slate-200">
                        {user._count.products}
                      </span>
                    </td>

                    {/* Statut d'activité */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                        user.is_active 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                        <span>{user.is_active ? "Actif" : "Suspendu"}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 TIROIR LATÉRAL DÉROULANT (MODAL DRAWER) */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Arrière-plan flou d'ombrage */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Corps du Tiroir (Slide-in Right Container) */}
          <div className="w-full max-w-md bg-[#0C101D] border-l border-white/[0.08] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between animate-fade-in-left">
            <div className="space-y-6">
              {/* En-tête Tiroir */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Profil Détaillé Membre
                </h3>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fiche d'identité d'utilisateur */}
              <div className="flex items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedUser.profile_picture ? (
                    <img src={selectedUser.profile_picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-400 font-mono">
                      {(selectedUser.username || selectedUser.email).substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-white truncate">
                    {selectedUser.username || "Sans pseudo"}
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase mt-0.5">
                    ID unique : #{selectedUser.id}
                  </span>
                  <span className={`inline-block self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-full border mt-2 ${
                    selectedUser.role === "ADMIN" 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                  }`}>
                    Rôle : {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Informations Générales */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Informations Personnelles</h4>
                
                <div className="space-y-2 text-xs">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="font-mono">{selectedUser.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{selectedUser.phone || "Non renseigné"}</span>
                  </div>

                  {/* Inscription */}
                  <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Inscrit le {new Date(selectedUser.created_at).toLocaleDateString("fr-FR")} à {new Date(selectedUser.created_at).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit"})}</span>
                  </div>
                </div>
              </div>

              {/* Statistiques d'Activité */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Statistiques</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Articles Mis en Vente</span>
                    <span className="text-2xl font-black text-white mt-1 block">{selectedUser._count.products}</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confiance Profil</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      {selectedUser.is_certified ? "Certifié" : "Standard"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions de Modération (Pied du Drawer) */}
            <div className="border-t border-white/[0.06] pt-4 mt-6">
              {selectedUser.role === "ADMIN" ? (
                <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex gap-3 text-xs text-slate-400 leading-relaxed font-semibold">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                  <span>
                    Ce compte est un administrateur système. Ses privilèges de sécurité empêchent la désactivation administrative depuis l'interface client.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-500 block leading-tight font-semibold">
                    🔑 Actionner le statut d'activité suspend automatiquement toutes ses annonces sportives de vente dans le catalogue.
                  </span>
                  
                  {selectedUser.is_active ? (
                    <button
                      onClick={() => handleToggleActive(selectedUser.id, true)}
                      disabled={actionLoading}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(220,38,38,0.25)] flex items-center justify-center gap-2 active:scale-98"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="w-4 h-4" />
                          <span>Désactiver (Soft-Delete)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(selectedUser.id, false)}
                      disabled={actionLoading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-98"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Réactiver le Compte</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
