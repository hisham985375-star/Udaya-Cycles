"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Youtube, Twitter } from "lucide-react";

export function ContactClient({ contactInfo }: { contactInfo: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
      {/* Contact Details */}
      <div className="space-y-12">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight mb-4">Get In Touch</h2>
          <p className="text-text-secondary leading-relaxed">
            Have a question about a specific cycle, need help with an existing order, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        <div className="space-y-6">
          {contactInfo?.email && (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-1">Email</h3>
                <a href={`mailto:${contactInfo.email}`} className="text-lg font-bold text-text-primary hover:text-accent transition-colors">{contactInfo.email}</a>
              </div>
            </div>
          )}

          {contactInfo?.phone && (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-1">Phone</h3>
                <a href={`tel:${contactInfo.phone}`} className="text-lg font-bold text-text-primary hover:text-accent transition-colors">{contactInfo.phone}</a>
                {contactInfo.businessHours && <p className="text-sm text-text-secondary mt-1">{contactInfo.businessHours}</p>}
              </div>
            </div>
          )}

          {contactInfo?.address && (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-1">Headquarters</h3>
                <p className="text-lg font-bold text-text-primary">{contactInfo.address}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Follow Us</h3>
          <div className="flex items-center gap-4">
            {contactInfo?.instagram && <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"><Instagram className="w-4 h-4" /></a>}
            {contactInfo?.facebook && <a href={contactInfo.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"><Facebook className="w-4 h-4" /></a>}
            {contactInfo?.youtube && <a href={contactInfo.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"><Youtube className="w-4 h-4" /></a>}
            {contactInfo?.twitter && <a href={contactInfo.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"><Twitter className="w-4 h-4" /></a>}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-surface-raised rounded-3xl border border-border p-8 md:p-10">
        {success ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold text-text-primary">Message Sent!</h3>
            <p className="text-text-secondary">Thank you for reaching out. We will get back to you as soon as possible.</p>
            <button onClick={() => setSuccess(false)} className="mt-4 text-accent font-bold uppercase text-sm tracking-wide hover:underline">Send another message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-display font-bold text-text-primary uppercase tracking-tight mb-6">Send a Message</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Name <span className="text-error">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg border border-border rounded-xl p-4 text-text-primary focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Email <span className="text-error">*</span></label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-bg border border-border rounded-xl p-4 text-text-primary focus:border-accent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-bg border border-border rounded-xl p-4 text-text-primary focus:border-accent outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Message <span className="text-error">*</span></label>
              <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-bg border border-border rounded-xl p-4 text-text-primary focus:border-accent outline-none resize-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-text-primary text-bg font-bold py-4 rounded-xl hover:bg-accent hover:text-bg transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
              <Send className="w-4 h-4" /> {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
