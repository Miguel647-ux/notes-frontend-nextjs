'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '../../../lib/auth';
import { BookOpen, GraduationCap, LogOut, PlusCircle, ClipboardList } from 'lucide-react';

interface Affectation {
    id: number;
    classe: { id: number; nom: string; annee_academique: string };
    matiere: { id: number; nom: string; code: string };
    annee: string;
}

export default function EnseignantDashboard() {
    const router = useRouter();
    const [prof, setProf] = useState<User | null>(null);
    const [affectations, setAffectations] = useState<Affectation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getUser();
        // Sécurité : Si pas connecté ou pas enseignant, retour au login
        if (!currentUser || currentUser.role !== 'enseignant') {
            router.push('/login');
            return;
        }
        setProf(currentUser);

        // Récupérer les cours attribués à ce prof depuis l'API Laravel
        const token = authService.getToken();
        fetch('http://127.0.0.1:8000/api/enseignant/affectations', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        })
        .then(res => res.json())
        .then(data => {
            setAffectations(data);
            setLoading(false);
        })
        .catch(() => setLoading(false));

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
        }
    };


    // Vérification immédiate au montage
    checkAuth();

    // Vérification si l'utilisateur revient sur l'onglet ou fait "Flèche Avant"
    window.addEventListener("popstate", checkAuth);
    window.addEventListener("pageshow", checkAuth);

    return () => {
        window.removeEventListener("popstate", checkAuth);
        window.removeEventListener("pageshow", checkAuth);
    };
    }, [router]);

    const handleLogout = async () => {
        await authService.logout();
        router.push('/login');
    };

    if (!prof) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans">
            {/* Header */}
            <header className="border-b border-[#1f2937] bg-[#0b0c10] px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#FACC15]">Ecole "Le Savoir"</h1>
                    <p className="text-xs text-gray-400">Espace Enseignant — Suivi Pédagogique</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium">{prof.nom}</p>
                        <p className="text-xs text-[#FACC15] capitalize">Professeur</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="p-2.5 bg-[#111827] hover:bg-red-950/40 hover:text-red-400 border border-[#374151] rounded-xl transition-colors text-gray-400"
                        aria-label="Se déconnecter"
                        title="Se déconnecter"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mes Cours & Classes</h2>
                    <p className="text-gray-400 text-sm">Sélectionnez un cours pour saisir ou consulter les notes.</p>
                </div>

                {loading ? (
                    <p className="text-gray-500">Chargement de vos attributions...</p>
                ) : affectations.length === 0 ? (
                    <div className="bg-[#0b0c10] border border-[#1f2937] p-6 rounded-2xl text-center text-gray-400">
                        Aucune classe ne vous est attribuée pour le moment.
                    </div>
                ) : (
                    /* Grille des matières gérées par le prof */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.isArray(affectations) && affectations.map((aff) => (
                            <div key={aff.id} className="bg-[#0b0c10] border border-[#1f2937] p-6 rounded-2xl space-y-4 hover:border-[#FACC15]/40 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="px-2.5 py-1 bg-[#1e1b4b] text-[#FACC15] text-xs font-semibold rounded-md border border-yellow-500/10">
                                            {aff.matiere.code}
                                        </span>
                                        <h3 className="text-lg font-bold text-white pt-1">{aff.matiere.nom}</h3>
                                    </div>
                                    <div className="p-3 bg-neutral-900 rounded-xl text-gray-400">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-gray-500" />
                                        <span>{aff.classe.nom}</span>
                                    </div>
                                    <span className="text-xs bg-neutral-900 px-2 py-1 rounded text-neutral-400">
                                        {aff.annee}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {/* Bouton Voir les Notes */}
<button 
  onClick={() => router.push(`/enseignant/notes/voir?id=${aff.id}`)}
  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#374151] rounded-xl text-sm font-medium transition-colors text-white w-full sm:w-auto"
>
  <BookOpen className="w-4 h-4" />
  <span>Voir les Notes</span>
</button>

{/* Bouton Saisir Notes */}
<button 
  onClick={() => router.push(`/enseignant/notes/saisir?id=${aff.id}`)}
  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FACC15] hover:bg-[#eab308] text-black rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
>
  <PlusCircle className="w-4 h-4" />
  <span>Saisir Notes</span>
</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}