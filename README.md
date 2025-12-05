# WINUX : Plateforme Éducative de Reconditionnement Numérique
**Projet Nuit de l'Info 2025 | Équipe : Les Artisans du Code**

## 📑 Présentation du Projet
WINUX est une application web simulant un environnement de bureau (Desktop Environment) de type Linux directement dans le navigateur.

Notre mission est de lutter contre l'obsolescence programmée et les déchets électroniques. Le projet démontre de manière interactive comment un matériel jugé "obsolète" peut être revitalisé grâce à des systèmes d'exploitation légers et open-source. L'interface reprend les codes visuels d'un OS moderne pour réduire la friction d'apprentissage et dédramatiser le passage à Linux.

## 🎯 Défis Validés & Implémentations
Ce projet a été conçu pour répondre techniquement et créativement aux défis suivants :

| Défi Nuit de l'Info | Implémentation dans WINUX |
|:-------------|:-----------|
| **Défi de la nuit 2025** | **Interface Desktop Web (GUI)** : Une UX unifiée regroupant éducation et outils dans un environnement fenêtré intuitif, prouvant que Linux est accessible à tous. |
| **La zerguèm de la nuit** | **Module "Laser Game"** : Intégration d'un jeu de tir arcade développé spécifiquement pour le projet. |
| **On veut du gros pixel !** | **Direction Artistique Rétro** : Choix d'une esthétique Pixel Art cohérente sur les jeux (Snake, Laser) pour allier nostalgie et légèreté des assets graphiques. |
| **Hidden Snake 📦** | **Snake** : Intégration du jeux Snake revisité, accessible via l'interface bureau. |
| **Chat'bruti** | **CLI Assistant** : Implémentation d'un agent conversationnel décalé au sein de l'invite de commande simulée. |
| **L'ergonomie : simplifier pour mieux vivre.** | **Formulaire frustrant** : Implémentation d'un formulaire impossible à finir. |

## ⚙️ Fonctionnalités Techniques

1. Gestionnaire de Fenêtres (Window Manager)
Un système complet d'interface graphique (GUI) codé from scratch :

    **Drag** : Algorithme de déplacement des fenêtres en temps réel.

    **Resizing** : Redimensionnement dynamique des fenêtres via les bordures.

    **Z-Index Management** : Gestion de la profondeur et du focus (mise au premier plan au clic).

2. Émulateur de Terminal (Shell Bash-like)
Une reproduction fidèle d'un terminal Linux pour l'initiation à la ligne de commande :

    **Virtual File System (VFS)** : Simulation d'une arborescence de fichiers, permettant la navigation (cd), la liste (ls) et la lecture (cat).

    **Command Parsing** : Interpréteur de commandes supportant les arguments.

    **Éducation** : Idéal pour apprendre les bases sans risque de casser son vrai PC.

3. Module Arcade : Snake Evolution
Une réinterprétation avancée du classique Snake :

    **Système de progression** : Intégration de différents niveaux de difficulté. Permet l'obtention d'un code permettant d'acceder au droit admin du terminal.

    **Boss Battles** : Mécaniques uniques où le joueur doit affronter des difficultés à des étapes clés (acceleration,invisibilité,obstacle).

    **Moteur physique** : Gestion des collisions grid-based optimisée.

4. Module Rétro : Laser Game 8-Bit
Un jeu de tir au style graphique affirmé :

    **Esthétique** : Rendu "8bit" respectant les contraintes du défi.

    **Gameplay** : Mécaniques de tir et de déplacement fluides.

    **Tableau de bord (Dashboard)** : Une application dédiée affichant les statistiques, les high-scores et les performances du joueur en temps réel.

5. Formulaire   de l'impossible
Un formulaire de connexion admin conçu comme une épreuve :

    **Objectif** : Rendre la validation presque impossible pour illustrer les frustrations utilisateurs (et tester la patience du jury).

    **Validation** : Succession de validation de critère pour un mot de passe robuste:

    - La longueur du mot de passe doit être > à 32 chars
    - Chaque lettre qui a un index pair doit être en majuscule [index de la premiere lettre:0]
    - La somme de tous les chiffres doit être égale à 8
    - Au moins 3 charactères d'alphabet cirilique
    - Au moins 3 émojis
    - Le mot de passe doit inclure le prénom du dernier président de la 4e république française (rené)
    - Le mot de passe doit contenir le mois des premiers pas de l'homme sur la lune, écrit en binaire sur 4 bits [20 juillet 1969, juillet->07->0111]
    - Le mot de passe doit contenir votre adresse IP au format X.X.X.X, ou les X sont >=0 et <=255
    - un captcha très cool !
    - Un code final de vérification sera donné dans le jeu snake.

    Exemple de mot de passe fonctionnel: AaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaВЕж😁😁😅​3RENE0111_X.X.X.X

    Ou les X sont à remplacer par votre ip publique (monip.com)

6. Chat'Bruti
Un chat bot qui reponds parfaitement à l'opposé mathématique de votre question, c'est à dire qu'il prend votre question, la passe dans un model de sentence embbedding qui la transforme en très grand vecteur et calcule la distance euclidienne avec tous les vecteur de notre base de donnée de question et répond avec la réponse de la question la plus éloigner voilà pour nous garitissons la réponse la plus insatisfesante possible, avec les compliments de notre Chief Database Operator Théo. 
Si le chatbot ne marche pas n'hesitez pas me contactez au : emmanuel.vermorel@etu.unice.fr 

## 🛠 Stack Technique
Nous avons fait le choix de la performance et de la légèreté.

**Langage** : TypeScript (Compilé en ES6) & HTML5.

**Styling** : CSS3 Natif (Utilisation de CSS Grid/Flexbox et Variables CSS).

**Dépendances** : 0. Aucun framework (pas de React/Angular), aucune librairie externe. Tout est fait maison.

## 🚀 Installation & Démarrage
Le projet étant ébergé sur un serveur distant http et pas https par manque de moyen voici le lien du projet :

Si vous voulez accedez au projet en local : 
`git clone https://github.com/MaitreyaLeLion/LesArtisansDuCode.git`

## 👥 L'équipe "Les Artisans du Code"
- Deronne Thomas
- Nicolas Erwan
- Vermorel Emmanuel
- Traversari-Osicki Theo
- Bernabe Axel
- Botté siméon

---
© 2025 Les Artisans du Code - Nuit de l'Info 2025.