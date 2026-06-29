"use client";

import { useState, useEffect } from "react";

interface Matiere {
  id: number;
  nom: string;
  code: string;
  coefficient_defaut: number;
}

export default function GestionMatieres() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);

  // Formulaire
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [coefficient, setCoefficient] = useState(2);

  // Charger les matières au démarrage
  useEffect(() => {
    fetchMatieres();
  }, []);

  const fetchMatieres = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/matieres", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMatieres(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (matiere: Matiere | null = null) => {
    if (matiere) {
      setEditingMatiere(matiere);
      setNom(matiere.nom);
      setCode(matiere.code);
      setCoefficient(matiere.coefficient_defaut);
    } else {
      setEditingMatiere(null);
      setNom("");
      setCode("");
      setCoefficient(2);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMatiere
      ? `http://127.0.0.1:8000/api/matieres/${editingMatiere.id}`
      : "http://127.0.0.1:8000/api/matieres";
    const method = editingMatiere ? "PUT" : "POST";

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
          code,
          coefficient_defaut: coefficient,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchMatieres();
      } else {
        alert("Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (error) {
      console.error("Erreur système:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette matière ?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/matieres/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        fetchMatieres();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <div className="p-6 bg-[#000000] min-h-screen text-white">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FACC15]">Gestion des Matières</h1>
          <p className="text-sm text-gray-400 mt-1">Consultez, ajoutez et modifiez les matières de la plateforme.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#FACC15] text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200"
        >
          + Ajouter une matière
        </button>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Chargement des données...</div>
      ) : (
        <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] text-gray-400 text-sm font-semibold border-b border-gray-800">
                <th className="p-4">ID</th>
                <th className="p-4">Code</th>
                <th className="p-4">Nom de la Matière</th>
                <th className="p-4">Coefficient par défaut</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {matieres.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Aucune matière trouvée.</td>
                </tr>
              ) : (
                matieres.map((matiere) => (
                  <tr key={matiere.id} className="hover:bg-[#1a1a1a] transition">
                    <td className="p-4 text-gray-400 font-mono">{matiere.id}</td>
                    <td className="p-4 font-semibold text-[#FACC15]">{matiere.code}</td>
                    <td className="p-4 text-gray-200">{matiere.nom}</td>
                    <td className="p-4 text-gray-300">{matiere.coefficient_defaut}</td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => openModal(matiere)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        Éditer
                      </button>
                      <span className="text-gray-700">|</span>
                      <button
                        onClick={() => handleDelete(matiere.id)}
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
              {editingMatiere ? "Modifier la matière" : "Ajouter une matière"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code-input" className="block text-sm text-gray-400 mb-1">Code Matière</label>
                <input
                  id="code-input"
                  title="Code Matière"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ex: DEV401"
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label htmlFor="nom-input" className="block text-sm text-gray-400 mb-1">Nom Complet</label>
                <input
                  id="nom-input"
                  title="Nom Complet"
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: Développement Backend Laravel"
                  className="w-full bg-[#161616] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label htmlFor="coeff-input" className="block text-sm text-gray-400 mb-1">Coefficient</label>
                <input
                  id="coeff-input"
                  title="Coefficient"
                  type="number"
                  required
                  min={1}
                  value={coefficient}
                  onChange={(e) => setCoefficient(parseInt(e.target.value))}
                  placeholder="ex: 2"
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