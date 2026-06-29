"use client";

import { useState, useEffect } from "react";

interface Classe {
  id: number;
  nom: string;
  annee_academique: string;
}

export default function GestionClasses() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);

  // Formulaire
  const [nom, setNom] = useState("");
  const [anneeAcademique, setAnneeAcademique] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/classes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Erreur chargement classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (classe: Classe | null = null) => {
    if (classe) {
      setEditingClasse(classe);
      setNom(classe.nom);
      setAnneeAcademique(classe.annee_academique || "");
    } else {
      setEditingClasse(null);
      setNom("");
      setAnneeAcademique("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingClasse
      ? `http://127.0.0.1:8000/api/classes/${editingClasse.id}`
      : "http://127.0.0.1:8000/api/classes";
    const method = editingClasse ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          nom, 
          annee_academique: anneeAcademique 
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchClasses();
      } else {
        alert("Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (error) {
      console.error("Erreur système:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette classe ?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/classes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error("Erreur suppression classe:", error);
    }
  };

  return (
    <div className="p-6 bg-[#000000] min-h-screen text-white">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FACC15]">Gestion des Classes</h1>
          <p className="text-sm text-gray-400 mt-1">Configurez les différentes promotions et sections de l'établissement.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#FACC15] text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200"
        >
          + Ajouter une classe
        </button>
      </div>

      {/* Tableau des données */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Chargement des données...</div>
      ) : (
        <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] text-gray-400 text-sm font-semibold border-b border-gray-800">
                <th className="p-4">ID</th>
                <th className="p-4">Nom de la Classe</th>
                <th className="p-4">Année Académique</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Aucune classe trouvée.</td>
                </tr>
              ) : (
                classes.map((classe) => (
                  <tr key={classe.id} className="hover:bg-[#1a1a1a] transition">
                    <td className="p-4 text-gray-400 font-mono">{classe.id}</td>
                    <td className="p-4 font-semibold text-[#FACC15]">{classe.nom}</td>
                    <td className="p-4 text-gray-300">{classe.annee_academique}</td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => openModal(classe)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        Éditer
                      </button>
                      <span className="text-gray-700">|</span>
                      <button
                        onClick={() => handleDelete(classe.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'Ajout / Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#111111] border border-gray-800 w-full max-w-md rounded-xl p-6 shadow-xl text-white">
            <h2 className="text-xl font-bold text-[#FACC15] mb-4">
              {editingClasse ? "Modifier la classe" : "Créer une classe"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom de la Classe</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: Informatique de Gestion 2"
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Année Académique</label>
                <input
                  type="text"
                  required
                  value={anneeAcademique}
                  onChange={(e) => setAnneeAcademique(e.target.value)}
                  placeholder="ex: 2025-2026"
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#FACC15] text-black font-semibold px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}