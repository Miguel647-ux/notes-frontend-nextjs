'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Award, AlertTriangle } from 'lucide-react';

function VoirNotesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const affectationId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coursInfo, setCoursInfo] = useState({ matiere: 'Chargement...', classe: '...' });
    const [bulletins, setBulletins] = useState<any[]>([]);

    useEffect(() => {
        if (affectationId) {
            const token = localStorage.getItem('token');

            fetch(`http://127.0.0.1:8000/api/enseignant/affectations/${affectationId}/etudiants`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            })
            .then(res => {
                if (!res.ok) {
                    console.error("Statut de la réponse :", res.status);
                    throw new Error('Impossible de charger les données.');
                }
                return res.json();
            })
            .then(data => {
                // ✅ LE SHIELD ÉTAIT ICI : On remplit enfin tes variables d'état !
                setCoursInfo({ matiere: data.matiere, classe: data.classe });
                setBulletins(data.bulletins || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
        }
    }, [affectationId]);

    const notesValides = bulletins.map(b => b.note).filter(n => n !== null && n !== undefined);
    
    const moyenneClasse = notesValides.length > 0 ? notesValides.reduce((acc, curr) => acc + curr, 0) / notesValides.length : 0;
    const noteMax = notesValides.length > 0 ? Math.max(...notesValides) : 0;
    const noteMin = notesValides.length > 0 ? Math.min(...notesValides) : 0;

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-medium">Chargement du relevé des notes réelles...</div>;
    if (error) return <div className="min-h-screen bg-black text-red-400 flex items-center justify-center font-medium">Erreur : {error}</div>;

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans p-8">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FACC15] mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
            </button>

            <div className="mb-8">
                <span className="text-xs font-semibold px-2.5 py-1 bg-purple-950/50 text-purple-400 border border-purple-900/50 rounded-md">Consultation Directe BD</span>
                <h1 className="text-3xl font-bold tracking-tight mt-2">{coursInfo.matiere}</h1>
                <p className="text-gray-400 text-sm mt-1">Classe : {coursInfo.classe}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 max-w-4xl">
                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Moyenne Générale</p>
                        <h3 className="text-2xl font-bold mt-1 text-[#FACC15]">
                            {notesValides.length > 0 ? `${moyenneClasse.toFixed(2)} / 20` : '-- / 20'}
                        </h3>
                    </div>
                    <div className="p-3 bg-amber-950/40 text-[#FACC15] border border-amber-900/40 rounded-xl">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Meilleure Note</p>
                        <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                            {notesValides.length > 0 ? `${noteMax.toFixed(2)} / 20` : '-- / 20'}
                        </h3>
                    </div>
                    <div className="p-3 bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 rounded-xl">
                        <Award className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-[#0b0c10] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Note Faible</p>
                        <h3 className="text-2xl font-bold mt-1 text-red-400">
                            {notesValides.length > 0 ? `${noteMin.toFixed(2)} / 20` : '-- / 20'}
                        </h3>
                    </div>
                    <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/40 rounded-xl">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="bg-[#0b0c10] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl max-w-4xl">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-[#1f2937] bg-[#111827]/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <th className="p-4">Nom & Prénoms</th>
                            <th className="p-4 text-right w-40">Note Actuelle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2937]">
                        {bulletins.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="p-8 text-center text-gray-500">
                                    Aucun étudiant inscrit dans cette filière pour le moment.
                                </td>
                            </tr>
                        ) : (
                            bulletins.map((b) => (
                                <tr key={b.id} className="hover:bg-[#111827]/20 transition-colors">
                                    <td className="p-4 font-medium">{b.nom.toUpperCase()} {b.prenom}</td>
                                    <td className={`p-4 text-right font-bold ${b.note === null ? 'text-gray-600' : b.note >= 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {b.note !== null ? b.note.toFixed(2) : 'Non noté'}
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

export default function VoirNotesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>}>
            <VoirNotesContent />
        </Suspense>
    );
}