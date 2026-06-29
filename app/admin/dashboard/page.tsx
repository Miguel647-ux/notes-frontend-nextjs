'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '../../../lib/auth';
import { Users, BookOpen, GraduationCap, School, LogOut } from 'lucide-react';
import GestionMatieres from "../matieres/page"; // Ou le chemin exact vers ton fichier
import GestionClasses from "../classes/page";
import GestionAffectations from '../affectations/page';

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<string>('dashboard');

// On garde l'état initial global
const [stats, setStats] = useState({
  etudiants: 5,
  enseignants: 2,
  matieres: 3,
  classes: 2 // Ce chiffre va maintenant devenir dynamique !
});

// Fonction globale pour charger les statistiques réelles depuis Laravel
const fetchDashboardStats = async () => {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  try {
    // 1. Récupération du compteur de matières
    const resMatieres = await fetch("http://127.0.0.1:8000/api/matieres-count", { headers });
    let totalMatieres = stats.matieres;
    if (resMatieres.ok) {
      const data = await resMatieres.json();
      totalMatieres = data.total;
    }

    // 2. Récupération du tableau des classes pour obtenir le vrai nombre
    const resClasses = await fetch("http://127.0.0.1:8000/api/classes", { headers });
    let totalClasses = stats.classes;
    if (resClasses.ok) {
      const data = await resClasses.json();
      totalClasses = data.length;
    }

    // 3. Mise à jour unique de l'état avec les vraies valeurs de la BDD
    setStats(prevStats => ({
      ...prevStats,
      matieres: totalMatieres,
      classes: totalClasses
    }));

  } catch (error) {
    console.error("Erreur lors de l'actualisation des compteurs :", error);
  }
};

// Déclencher le chargement au montage et à chaque changement d'onglet
useEffect(() => {
  fetchDashboardStats();
}, [activeTab]);

    useEffect(() => {
        const currentUser = authService.getUser();
        // Sécurité : Si pas connecté ou pas admin, retour au login
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/login');
        } else {
            setAdmin(currentUser);
        }
    }, [router]);

    useEffect(() => {
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

    const handleLogout = () => {
  // 1. Vide entièrement le localStorage (Token, rôles, etc.)
  localStorage.clear();
  
  // 2. Si tu utilises des cookies ou des états globaux, vide-les ici
  
  // 3. Redirige vers la page de login
  window.location.href='login';
  
  // 4. Optionnel mais ultra efficace : force un rechargement de la page 
  // pour réinitialiser tous les états React en mémoire
  window.location.reload();
};

    if (!admin) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans">
            {/* Barre de navigation supérieure */}
            <header className="border-b border-[#1f2937] bg-[#0b0c10] px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#FACC15]">Ecole "Le Savoir" <span className="text-xs text-gray-400 font-normal"></span></h1>
                    <p className="text-xs text-gray-400">Espace Administratif</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium">{admin.nom}</p>
                        <p className="text-xs text-emerald-400 capitalize">{admin.role}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2.5 bg-[#111827] hover:bg-red-950/40 hover:text-red-400 border border-[#374151] rounded-xl transition-colors text-gray-400"
                        title="Déconnexion"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Menu Latéral Gauche */}
                <aside className="w-64 min-h-[calc(100vh-72px)] bg-[#0b0c10] border-r border-[#1f2937] p-4 space-y-2">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
                    
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 p-2.5 rounded-lg w-full text-left transition-colors ${activeTab === 'dashboard' ? 'bg-[#1e1e24] text-[#FACC15]' : 'text-gray-400 hover:bg-[#111827]'}`}
                    >
                        <School className="w-4 h-4" />
                        <span>Vue d'ensemble</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex items-center gap-3 p-2.5 rounded-lg w-full text-left transition-colors ${activeTab === 'classes' ? 'bg-[#1e1e24] text-[#FACC15]' : 'text-gray-400 hover:bg-[#111827]'}`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Gestion des Classes</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('matieres')}
                        className={`flex items-center gap-3 p-2.5 rounded-lg w-full text-left transition-colors ${activeTab === 'matieres' ? 'bg-[#1e1e24] text-[#FACC15]' : 'text-gray-400 hover:bg-[#111827]'}`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Gestion des Matières</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('affectations')}
                        className={`flex items-center gap-3 p-2.5 rounded-lg w-full text-left transition-colors ${activeTab === 'affectations' ? 'bg-[#1e1e24] text-[#FACC15]' : 'text-gray-400 hover:bg-[#111827]'}`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Affectations & Rôles</span>
                    </button>
                </aside>

                {/* Zone d'affichage dynamique à Droite */}
                <main className="flex-1 p-8">
                    
                    {/* ONGLET 1 : VUE D'ENSEMBLE (DASHBOARD) */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
                                <p className="text-gray-400 text-sm">Aperçu en temps réel des entités de la plateforme.</p>
                            </div>

                            {/* Grille des indicateurs (KPI Cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase">Étudiants Inscrits</p>
                                        <h3 className="text-3xl font-bold mt-1 text-white">{stats.etudiants}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-950/50 text-blue-400 border border-blue-900/50 rounded-xl">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase">Enseignants Actifs</p>
                                        <h3 className="text-3xl font-bold mt-1 text-white">{stats.enseignants}</h3>
                                    </div>
                                    <div className="p-3 bg-amber-950/40 text-[#FACC15] border border-amber-900/40 rounded-xl">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase">Matières Enseignées</p>
                                        <h3 className="text-3xl font-bold mt-1 text-white">{stats.matieres}</h3>
                                    </div>
                                    <div className="p-3 bg-purple-950/50 text-purple-400 border border-purple-900/50 rounded-xl">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase">Classes Créées</p>
                                        <h3 className="text-3xl font-bold mt-1 text-white">{stats.classes}</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 rounded-xl">
                                        <School className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Section d'accueil rapide */}
                            <div className="bg-[#0b0c10] border border-[#1f2937] p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15] opacity-5 rounded-full blur-[80px]"></div>
                                <h3 className="text-lg font-semibold text-[#FACC15] mb-2">Actions Administratives Rapides</h3>
                                <p className="text-gray-400 text-sm max-w-xl mb-4">
                                    Utilise le menu latéral pour configurer les nouvelles classes de l'établissement, ajouter des matières d'enseignement, ou lier les professeurs à leurs cours respectifs.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ONGLET 2 : GESTION DES CLASSES */}
                    {activeTab === 'classes' && <GestionClasses />}

                    {/* ONGLET 3 : GESTION DES MATIÈRES */}
                    {activeTab === 'matieres' && <GestionMatieres />}

                    {/* ONGLET 4 : AFFECTATIONS */}
                    {/* Dans le contenu principal de app/admin/dashboard/page.tsx */}
{activeTab === 'affectations' && (
  <div className="w-full">
    <GestionAffectations />
  </div>
)}

                </main>
            </div>
        </div>
    );
}