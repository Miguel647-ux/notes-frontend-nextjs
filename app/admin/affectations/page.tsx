"use client";

import { useState, useEffect } from "react";

interface Affectation {
  id: number;
  enseignant_nom: string;
  matiere_nom: string;
  matiere_code: string;
  classe_nom: string;
  annee: string;
}

interface Item {
  id: number;
  nom?: string;
  code?: string;
  annee_academique?: string;
}

export default function GestionAffectations() {
  // Initialisation sécurisée
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [enseignants, setEnseignants] = useState<Item[]>([]);
  const [matieres, setMatieres] = useState<Item[]>([]);
  const [classes, setClasses] = useState<Item[]>([]);

  const [selectedEnseignant, setSelectedEnseignant] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("");

  useEffect(() => {
    fetchAffectations();
    fetchFormData();
  }, []);

  const fetchAffectations = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/affectations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Sécurité : s'assurer que data est bien un tableau
        setAffectations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur chargement affectations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/affectations/form-data", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setEnseignants(data?.enseignants && Array.isArray(data.enseignants) ? data.enseignants : []);
        setMatieres(data?.matieres && Array.isArray(data.matieres) ? data.matieres : []);
        setClasses(data?.classes && Array.isArray(data.classes) ? data.classes : []);
      }
    } catch (error) {
      console.error("Erreur chargement form data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/affectations/enseignant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          enseignant_id: selectedEnseignant,
          matiere_id: selectedMatiere,
          classe_id: selectedClasse,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSelectedEnseignant("");
        setSelectedMatiere("");
        setSelectedClasse("");
        fetchAffectations();
      } else {
        const errData = await res.json();
        alert(errData.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Annuler cette affectation ?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/affectations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) fetchAffectations();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-[#000000] min-h-screen text-white w-full">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FACC15]">Affectations & Rôles</h1>
          <p className="text-sm text-gray-400 mt-1">Liez un enseignant à une matière et une classe spécifique.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FACC15] text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200"
        >
          + Nouvelle Affectation
        </button>
      </div>

      {/* Tableau principal avec garde-fous */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Chargement des liaisons...</div>
      ) : (
        <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] text-gray-400 text-sm font-semibold border-b border-gray-800">
                <th className="p-4">Enseignant</th>
                <th className="p-4">Matière attribuée</th>
                <th className="p-4">Classe affectée</th>
                <th className="p-4">Année Académique</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {affectations && affectations.length > 0 ? (
                affectations.map((aff) => (
                  <tr key={aff.id} className="hover:bg-[#1a1a1a] transition">
                    <td className="p-4 font-medium text-white">{aff.enseignant_nom}</td>
                    <td className="p-4">
                      <span className="text-[#FACC15] font-semibold">{aff.matiere_nom}</span>
                      <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono ml-2">{aff.matiere_code}</span>
                    </td>
                    <td className="p-4 text-gray-300">{aff.classe_nom}</td>
                    <td className="p-4 text-gray-400 font-mono text-sm">{aff.annee || "N/A"}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(aff.id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition">
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Aucune affectation enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'insertion pure à 3 clés */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#111111] border border-gray-800 w-full max-w-md rounded-xl p-6 shadow-xl text-white">
            <h2 className="text-xl font-bold text-[#FACC15] mb-4">Créer une liaison pédagogique</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Enseignant */}
              <div>
                <label htmlFor="enseignant-select" className="block text-sm text-gray-400 mb-1">Enseignant</label>
                <select
                  id="enseignant-select"
                  required
                  value={selectedEnseignant}
                  onChange={(e) => setSelectedEnseignant(e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white"
                >
                  <option value="">Sélectionner un enseignant...</option>
                  {enseignants && enseignants.length > 0 && enseignants.map((e) => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>

              {/* Matière */}
              <div>
                <label htmlFor="matiere-select" className="block text-sm text-gray-400 mb-1">Matière</label>
                <select
                  id="matiere-select"
                  required
                  value={selectedMatiere}
                  onChange={(e) => setSelectedMatiere(e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white"
                >
                  <option value="">Sélectionner une matière...</option>
                  {matieres && matieres.length > 0 && matieres.map((m) => (
                    <option key={m.id} value={m.id}>[{m.code}] {m.nom}</option>
                  ))}
                </select>
              </div>

              {/* Classe */}
              <div>
                <label htmlFor="classe-select" className="block text-sm text-gray-400 mb-1">Classe cible</label>
                <select
                  id="classe-select"
                  required
                  value={selectedClasse}
                  onChange={(e) => setSelectedClasse(e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white"
                >
                  <option value="">Sélectionner une classe...</option>
                  {classes && classes.length > 0 && classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.annee_academique})</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-transparent border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                  Annuler
                </button>
                <button type="submit" className="bg-[#FACC15] text-black font-semibold px-5 py-2 rounded-lg hover:bg-yellow-500 transition">
                  Confirmer la liaison
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}