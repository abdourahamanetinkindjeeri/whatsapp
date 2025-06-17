# WhatsApp Clone Project

Un clone de WhatsApp Web développé avec JavaScript, offrant une expérience de messagerie en temps réel avec des fonctionnalités similaires à WhatsApp.

## 🌟 Fonctionnalités

- 💬 Messagerie en temps réel
- 👥 Gestion des contacts et des groupes
- 📱 Interface responsive
- 🔍 Recherche de messages et contacts
- 🔒 Authentification des utilisateurs

## 🚀 Technologies Utilisées

- Frontend:

  - JavaScript
  - HTML5
  - CSS3
  - TailwindCSS
  - Vite

- Backend:
  - Node.js
  - JSON Server
  - Express

## 📦 Installation

1. Clonez le dépôt :

```bash
git clone https://github.com/votre-username/whatsapp-project.git
cd whatsapp-project
```

2. Installez les dépendances :

```bash
npm install
```

3. Démarrez le serveur de développement :

```bash
npm run dev
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
NODE_ENV=development
API_URL=http://localhost:3000
```

## 🏗️ Structure du Projet

```
whatsapp-project/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── discussion/
│   │   ├── messages/
│   │   └── shared/
│   ├── services/
│   ├── utils/
│   └── server/
├── public/
└── package.json
```

## 🚀 Déploiement

### Frontend (Vercel)

1. Installez Vercel CLI :

```bash
npm install -g vercel
```

2. Déployez :

```bash
vercel
```

### Backend (Render)

1. Créez un compte sur [Render](https://render.com)
2. Créez un nouveau Web Service
3. Connectez votre dépôt GitHub
4. Configurez avec :
   - Build Command: `cd src/server && npm install`
   - Start Command: `cd src/server && node server.js`

## 📝 API Endpoints

- `GET /contacts` - Liste des contacts
- `GET /groups` - Liste des groupes
- `GET /messages` - Messages
- `POST /messages` - Envoyer un message
- `PUT /contacts/:id` - Mettre à jour un contact
- `DELETE /messages/:id` - Supprimer un message

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

## 🙏 Remerciements

- [WhatsApp Web](https://web.whatsapp.com) pour l'inspiration
- [JSON Server](https://github.com/typicode/json-server) pour l'API
- [TailwindCSS](https://tailwindcss.com) pour le style
