/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Plus, Trash2, Shield, UserCog } from "lucide-react";

export function AccountsClient({ initialAdmins, currentAdminId }: { initialAdmins: any[], currentAdminId: string }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // New Admin form state
  const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "", role: "admin" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdmins([...admins, data.admin]);
      setShowModal(false);
      setNewAdmin({ username: "", email: "", password: "", role: "admin" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isActive: !currentStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setAdmins(admins.map(a => a._id === id ? { ...a, isActive: !currentStatus } : a));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this admin account?")) return;
    
    try {
      const res = await fetch(`/api/admin/accounts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      
      setAdmins(admins.filter(a => a._id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Admin Accounts</h1>
          <p className="text-text-secondary text-sm">Manage staff access to the UDAYA admin panel.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="bg-surface-raised border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-text-secondary uppercase tracking-widest text-xs bg-surface/50">
              <th className="p-4 font-bold">Username</th>
              <th className="p-4 font-bold">Role</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Created</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                <td className="p-4 font-medium text-text-primary flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                    {admin.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    {admin.username}
                    <div className="text-xs text-text-muted font-normal">{admin.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    admin.role === 'superadmin' ? 'bg-error/10 text-error border border-error/20' : 'bg-surface border border-border text-text-secondary'
                  }`}>
                    {admin.role === 'superadmin' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                    {admin.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    admin.isActive ? 'bg-success/10 text-success border border-success/20' : 'bg-surface border border-border text-text-muted'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-success' : 'bg-text-muted'}`}></span>
                    {admin.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-text-muted text-xs">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  {admin._id !== currentAdminId && (
                    <>
                      <button 
                        onClick={() => toggleActive(admin._id, admin.isActive)}
                        className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-accent px-3 py-1 rounded border border-border hover:border-accent transition-colors"
                      >
                        {admin.isActive ? "Disable" : "Enable"}
                      </button>
                      <button 
                        onClick={() => handleDelete(admin._id)}
                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {admin._id === currentAdminId && (
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest px-2">You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="bg-surface-raised border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <h2 className="text-xl font-display font-bold text-text-primary uppercase tracking-tight border-b border-border pb-4">Create Admin Account</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Username <span className="text-error">*</span></label>
                <input required type="text" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none" placeholder="johndoe" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Email Address</label>
                <input type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none" placeholder="john@udayacycles.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Temporary Password <span className="text-error">*</span></label>
                <input required type="text" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none" placeholder="SuperSecret!" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Role</label>
                <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none">
                  <option value="admin">Admin (Standard Access)</option>
                  <option value="superadmin">Super Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-border text-text-secondary rounded-lg font-bold uppercase text-sm hover:text-text-primary hover:border-text-secondary transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-accent text-bg rounded-lg font-bold uppercase text-sm hover:bg-accent-dim transition-colors disabled:opacity-50">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
