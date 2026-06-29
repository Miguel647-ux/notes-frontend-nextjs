'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, LogIn, ShieldAlert, BookOpen, UserCheck } from 'lucide-react';

// Tableau d'images éducatives (Tu pourras remplacer les URLs Unsplash par tes propres images locales)
const BACKGROUND_IMAGES = [
  
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop", // Études / Écriture
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop", // Salle de classe / Tableau
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop"  // Bibliothèque / Livres
];

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effet pour faire défiler les images toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-1000">
      
      {/* --- CARROUSEL D'IMAGES EN BACKGROUND TRANSPARENT --- */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {BACKGROUND_IMAGES.map((image, index) => (
    <img
      key={index}
      src={image}
      alt="Background scolaire"
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 mix-blend-luminosity`}
      style={{
        
        opacity: index === currentImageIndex ? 0.50 : 0 
      }}
    />
  ))}
  {/* Voile sombre de sécurité pour le contraste du texte */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/40 via-[#000000]/70 to-[#000000] via-45%" />
</div>

      {/* Effets lumineux d'ambiance */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FACC15] opacity-[0.05] rounded-full blur-[150px] pointer-events-none z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1e1b4b] opacity-[0.15] rounded-full blur-[150px] pointer-events-none z-10"></div>

      {/* --- HEADER / NAVBAR --- */}
      <header className="border-b border-[#1f2937] bg-[#0b0c10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e1b4b] text-[#FACC15] rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Complexe Scolaire <span className="text-[#FACC15]">Le Savoir</span>
            </span>
          </div>
          
          <Link 
            href="/login" 
            className="px-5 py-2.5 bg-[#FACC15] hover:bg-[#eab308] text-black font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/5"
          >
            <LogIn className="w-4 h-4" />
            Portail Numérique
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center flex-grow flex flex-col justify-center items-center relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#374151] text-xs text-gray-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Année Académique 2025-2026
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-tight">
          L'excellence éducative au bout des doigts.
        </h1>
        
        <p className="text-gray-400 md:text-lg max-w-2xl mb-10 leading-relaxed">
          Bienvenue sur la plateforme officielle du Complexe Scolaire Le Savoir. Un espace sécurisé pour le suivi des notes, la gestion des cours et la communication pédagogique.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-[#FACC15] hover:bg-[#eab308] text-black font-bold rounded-xl text-base transition-all shadow-xl shadow-yellow-500/10 text-center"
          >
            Accéder à mon espace
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 bg-[#111827] hover:bg-[#1f2937] border border-[#374151] text-white font-medium rounded-xl text-base transition-all text-center"
          >
            En savoir plus
          </a>
        </div>

        {/* --- SECTION CARACTÉRISTIQUES --- */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          <div className="p-6 bg-[#0b0c10]/90 border border-[#1f2937] rounded-2xl backdrop-blur-sm">
            <div className="p-3 bg-[#111827] text-[#FACC15] w-fit rounded-xl mb-4">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Espace Étudiant</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Consultez vos notes en temps réel, suivez vos moyennes et téléchargez vos bulletins sécurisés.</p>
          </div>

          <div className="p-6 bg-[#0b0c10]/90 border border-[#1f2937] rounded-2xl backdrop-blur-sm">
            <div className="p-3 bg-[#111827] text-[#FACC15] w-fit rounded-xl mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Espace Enseignant</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Saisissez les notes, gérez vos classes attribuées et suivez l'évolution de vos élèves.</p>
          </div>

          <div className="p-6 bg-[#0b0c10]/90 border border-[#1f2937] rounded-2xl backdrop-blur-sm">
            <div className="p-3 bg-[#111827] text-[#FACC15] w-fit rounded-xl mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Administration</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Contrôle total sur les inscriptions, les attributions de matières et la sécurité globale du système.</p>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-[#1f2937] bg-[#0b0c10]/80 text-center py-6 text-xs text-gray-500 relative z-20">
        <p>© 2026 Complexe Scolaire Le Savoir. Tous droits réservés.</p>
      </footer>

    </div>
  );
}