'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '../../lib/auth';
import { toast, Toaster } from 'react-hot-toast';
import { LogIn, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.login({ email, password });
            
            // Extraction du token (tu as confirmé que c'était access_token)
            const extractedToken = (data as any).access_token || (data as any).token;

            if (extractedToken && data.user) {
                // 1. 💾 STOCKAGE CÔTÉ CLIENT (Pour tes requêtes d'API classiques)
                localStorage.setItem('token', extractedToken);
                localStorage.setItem('user', JSON.stringify(data.user));

                // 2. 🍪 COOKIES COMPATIBLES AVEC LE MIDDLEWARE (Lecture Serveur)
                // Expire après 24 heures (86400 secondes)
                document.cookie = `token=${extractedToken}; path=/; max-age=86400; SameSite=Strict`;
                document.cookie = `role=${data.user.role}; path=/; max-age=86400; SameSite=Strict`;

                toast.success(`Bienvenue, ${data.user.nom} !`);
                
                // Redirection fluide après le toast
                setTimeout(() => {
                    if (data.user.role === 'admin') window.location.href = '/admin/dashboard';
                    else if (data.user.role === 'enseignant') window.location.href = '/enseignant/dashboard';
                    else window.location.href = '/etudiant/dashboard';
                }, 800);
            } else {
                toast.error("Données d'authentification incomplètes reçues de l'API.");
            }

        } catch (error: any) {
            toast.error(error.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 relative overflow-hidden">
            <Toaster position="top-right" />
            
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FACC15] opacity-5 rounded-full blur-[120px]"></div>
            
            <div className="w-full max-w-md bg-[#0b0c10] border border-[#1f2937] p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-[#1e1b4b] text-[#FACC15] rounded-xl mb-3">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Portail Académique</h2>
                    <p className="text-gray-400 text-sm mt-1">Connectez-vous pour gérer vos notes et bulletins</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Adresse Email</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input 
                                type="text"
                                name="user_identifier_secure" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nom@demo.com"
                                className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-[#374151] rounded-xl text-white text-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input 
                                type="password" 
                                name="user_security_key"
                                id="user_security_key"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-[#374151] rounded-xl text-white text-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#FACC15] hover:bg-[#eab308] text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}