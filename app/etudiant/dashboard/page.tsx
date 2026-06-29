'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '../../../lib/auth';
import { toast, Toaster } from 'react-hot-toast';
import { BookOpen, Download, FileText, LogOut, Award, Calendar } from 'lucide-react';

interface NoteDetail {
    id: number;
    valeur: number;
    coefficient: number;
    type: string;
}

interface MatiereMoyenne {
    nom: string;
    code: string;
    moyenne: number;
    coefficient_total: number;
    notes: NoteDetail[];
}

interface BulletinData {
    classe_nom: string;
    annee_academique: string;
    moyenne_generale: number;
    moyennes_par_matiere: MatiereMoyenne[];
}

export default function EtudiantDashboard() {

    const router = useRouter();
    const [etudiant, setEtudiant] = useState<User | null>(null);
    const [bulletin, setBulletin] = useState<BulletinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const currentUser = authService.getUser();
        // Sécurité : Si non connecté ou pas étudiant, retour au login
        if (!currentUser || currentUser.role !== 'etudiant') {
            router.push('/login');
            return;
        }
        setEtudiant(currentUser);

        // Récupérer les notes et moyennes de l'étudiant
        const token = authService.getToken();
        fetch(`http://127.0.0.1:8000/api/etudiants/${currentUser.id}/moyennes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            setBulletin(data);
            setLoading(false);
        })
        .catch(() => {
            toast.error("Impossible de récupérer vos notes.");
            setLoading(false);
        });
        

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

    // Fonction pour déclencher le téléchargement du PDF codé sur Laravel
    const handleDownloadPDF = async () => {
        if (!etudiant) return;
        setDownloading(true);
        toast.loading("Génération du bulletin PDF...", { id: 'pdf-toast' });

        try {
            const token = authService.getToken();
            const response = await fetch(`http://127.0.0.1:8000/api/etudiants/${etudiant.id}/bulletin/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error();

            // Convertir la réponse en Blob (binaire) pour lancer le téléchargement du fichier
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bulletin_${etudiant.nom.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            toast.success("Bulletin téléchargé avec succès !", { id: 'pdf-toast' });
        } catch (error) {
            toast.error("Erreur lors du téléchargement du PDF.", { id: 'pdf-toast' });
        } finally {
            setDownloading(false);
        }
    };

   const handleLogout = () => {
    // 1. Nettoyage client
    localStorage.clear(); 
    
    // 2. Destruction des cookies en leur donnant une date d'expiration passée
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // 3. Redirection
    window.location.href = '/'; 
};

    if (!etudiant) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans">
            <Toaster position="top-right" />
            
            {/* Header */}
            <header className="border-b border-[#1f2937] bg-[#0b0c10] px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#FACC15]">Ecole "Le Savoir"</h1>
                    <p className="text-xs text-gray-400">Espace Étudiant — Mes Résultats</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium">{etudiant.nom}</p>
                        <p className="text-xs text-blue-400 capitalize">Étudiant</p>
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

            <main className="max-w-5xl mx-auto p-8 space-y-8">
                {loading ? (
                    <p className="text-gray-500">Chargement de vos résultats académiques...</p>
                ) : // Remplace : !bulletin par :
!bulletin || !bulletin.moyennes_par_matiere? (
                    <div className="bg-[#0b0c10] border border-[#1f2937] p-6 rounded-2xl text-center text-gray-400">
                        Aucune note n'est disponible pour le moment.
                    </div>
                ) : (
                    <>
                        {/* Carte de résumé générale */}
                        <div className="bg-[#0b0c10] border border-[#1f2937] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15] opacity-5 rounded-full blur-[80px]"></div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">{bulletin.classe_nom}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-500" /> {bulletin.annee_academique}</span>
                                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-gray-500" /> Semestre Actuel</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-[#111827] border border-[#374151] px-6 py-4 rounded-xl w-full md:w-auto justify-between md:justify-start">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Moyenne Générale</p>
                                    <p className="text-2xl font-black text-[#FACC15]">{bulletin.moyenne_generale} <span className="text-sm font-normal text-gray-400">/ 20</span></p>
                                </div>
                                <div className="p-3 bg-amber-950/40 text-[#FACC15] rounded-xl">
                                    <Award className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Titre et Bouton de Téléchargement */}
                        <div className="flex justify-between items-center pt-2">
                            <h3 className="text-lg font-bold tracking-tight">Détails des Notes par Matière</h3>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#FACC15] hover:bg-[#eab308] text-black font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" /> {downloading ? 'Téléchargement...' : 'Exporter en PDF'}
                            </button>
                        </div>

                        {/* Liste des matières et des notes détaillées */}
                        <div className="space-y-4">
                            {bulletin.moyennes_par_matiere.map((mat, idx) => (
                                <div key={idx} className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-neutral-900 px-2 py-0.5 rounded text-gray-400 border border-neutral-800 font-mono">{mat.code}</span>
                                            <h4 className="font-bold text-white text-base">{mat.nom}</h4>
                                        </div>
                                        {/* Liste des notes réelles de la matière */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {(mat.notes || []).map((note: any) => (
                                                <span key={note.id} className="text-xs bg-[#111827] border border-[#1f2937] px-2.5 py-1.5 rounded-lg text-gray-300">
                                                    <span className="font-semibold text-white">{note.valeur}/20</span> 
                                                    <span className="text-gray-500 ml-1">({note.type} x{note.coefficient})</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="text-right bg-neutral-900/40 border border-neutral-900 px-4 py-2.5 rounded-xl min-w-[120px]">
                                        <p className="text-[10px] text-gray-500 uppercase font-medium">Moyenne</p>
                                        <p className="text-lg font-bold text-white">{mat.moyenne} <span className="text-xs font-normal text-gray-400">/20</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}