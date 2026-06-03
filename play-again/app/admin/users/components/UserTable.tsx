"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface UserAdmin {
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

export interface UserTableProps {
  users: UserAdmin[];
  loading: boolean;
  onSelectUser: (user: UserAdmin) => void;
}

export default function UserTable({ users, loading, onSelectUser }: UserTableProps) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl text-left">
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
                  <span className="text-xs text-slate-500 font-bold">
                    Aucun utilisateur ne correspond à ces critères.
                  </span>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user)}
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
                    <span className="text-xs font-mono font-medium text-slate-300">{user.email}</span>
                  </td>

                  {/* Date inscription */}
                  <td className="p-4">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </td>

                  {/* Rôle */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        user.role === "ADMIN"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Nombre d'articles */}
                  <td className="p-4 text-center">
                    <span className="text-xs font-bold text-slate-200">{user._count.products}</span>
                  </td>

                  {/* Statut d'activité */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                        user.is_active
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
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
  );
}
