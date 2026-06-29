const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface User {
    id: number;
    nom: string;
    email: string;
    role: 'admin' | 'enseignant' | 'etudiant';
}

interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export const authService = {
    // 1. Connexion
    async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Identifiants incorrects');
        }

        const data: LoginResponse = await response.json();

        // Stockage du token et des infos utilisateurs localement
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    // 2. Déconnexion
    async logout(): Promise<void> {
        const token = this.getToken();
        
        if (token) {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }).catch(() => {
                // On ignore l'erreur si le token était déjà expiré côté serveur
            });
        }

        // Nettoyage local quoi qu'il arrive
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // 3. Récupérer le token stocké
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    // 4. Récupérer l'utilisateur connecté
    getUser(): User | null {
        if (typeof window !== 'undefined') {
            const userJson = localStorage.getItem('user');
            return userJson ? JSON.parse(userJson) : null;
        }
        return null;
    }
};