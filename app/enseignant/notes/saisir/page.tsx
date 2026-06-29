'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

function SaisirNotesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const affectationId = searchParams.get('id');
    const [saved, setSaved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loading, setLoading] = useState(true);
    const [etudiants, setEtudiants] = useState<any[]>([]);
    const [notes, setNotes] = useState<{ [key: number]: string }>({});
    const [coursInfo, setCoursInfo] = useState({ matiere: 'Chargement...', classe: '...' });

    useEffect(() => {
        if (affectationId) {
            const token = localStorage.getItem('token');
            
            // On appelle l'URL correspondante à api.php
            fetch(`http://127.0.0.1:8000/api/enseignant/affectations/${affectationId}/notes`, {
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error('Erreur lors du chargement des étudiants');
                return res.json();
            })
            .then(data => {
                setCoursInfo({ matiere: data.matiere, classe: data.classe });
                setEtudiants(data.etudiants || []);
                
                // Pré-remplir les inputs si des notes existent déjà en base de données
                const notesInitiales: { [key: number]: string } = {};
                data.etudiants.forEach((etd: any) => {
                    if (etd.note !== null) {
                        notesInitiales[etd.id] = etd.note.toString();
                    }
                });
                setNotes(notesInitiales);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [affectationId]);

    const handleNoteChange = (etudiantId: number, value: string) => {
        setNotes(prev => ({ ...prev, [etudiantId]: value }));
    };

    

    
    const handleEnregistrer = async () => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            // On parcourt toutes les notes saisies pour les envoyer individuellement ou en lot
            // Vu que ton NoteController@store traite une note à la fois, on boucle proprement
            for (const etudiantId of Object.keys(notes)) {
                const valor = notes[Number(etudiantId)];
                if (valor === '') continue; // On ignore les champs vides

                await fetch(`http://127.0.0.1:8000/api/notes`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        etudiant_id: Number(etudiantId),
                        matiere_id: Number(affectationId),
                        valeur: parseFloat(valor),
                        coefficient: 2, // Valeur par défaut requise par ton validateur Laravel
                        type: 'devoir', // Requis par ton validateur Laravel ('devoir' ou 'examen')
                        date_evaluation: new Date().toISOString().split('T')[0] // Date du jour requise
                    })
                });
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement des vrais étudiants...</div>;

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FACC15] mb-6">
                <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
            </button>
            <div className="mb-8">
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-950/40 text-[#FACC15] border border-amber-900/40 rounded-md">Saisie des Notes</span>
                <h1 className="text-3xl font-bold tracking-tight mt-2">{coursInfo.matiere}</h1>
                <p className="text-gray-400 text-sm mt-1">Classe : {coursInfo.classe}</p>
            </div>

            {saved && (
                <div className="mb-4 p-4 bg-emerald-950/40 border border-emerald-500 text-emerald-400 rounded-xl max-w-4xl">
                    Notes enregistrées avec succès dans la base de données !
                </div>
            )}

            <div className="bg-[#0b0c10] border border-[#1f2937] rounded-2xl p-6 max-w-4xl">
                <div className="divide-y divide-[#1f2937]">
                    {etudiants.map(etudiant => (
                        <div key={etudiant.id} className="flex items-center justify-between py-4">
                            <span className="font-medium">{etudiant.nom.toUpperCase()}</span>
                            <input 
                                type="number" 
                                min="0" 
                                max="20" 
                                step="0.25"
                                placeholder="--" 
                                value={notes[etudiant.id] || ''}
                                onChange={(e) => handleNoteChange(etudiant.id, e.target.value)}
                                className="w-24 bg-black border border-[#1f2937] rounded-xl px-3 py-2 text-center font-bold text-white focus:border-[#FACC15] focus:outline-none"
                            />
                        </div>
                    ))}
                </div>
                <button 
                    onClick={handleEnregistrer} 
                    disabled={isSubmitting}
                    className="mt-6 w-full md:w-auto float-right px-6 py-3 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer les Notes'}
                </button>
            </div>
        </div>
    );
}

export default function SaisirNotesPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <SaisirNotesContent />
        </Suspense>
    );
}