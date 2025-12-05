var WeaponMode;
(function (WeaponMode) {
    WeaponMode[WeaponMode["NORMAL"] = 0] = "NORMAL";
    WeaponMode[WeaponMode["SPREAD"] = 1] = "SPREAD";
    WeaponMode[WeaponMode["RAPID"] = 2] = "RAPID";
})(WeaponMode || (WeaponMode = {}));
// --- CONFIGURATION ---
const CONFIG = {
    playerSpeed: 0.6,
    friction: 0.94,
    bulletSpeed: 12,
    bulletRate: 120,
    baseEnemySpawnRate: 2500,
    baseEnemySpeed: 1.5,
    baseEnemyShootRate: 2000,
    enemyBulletSpeed: 6,
    powerUpSpawnRate: 8000,
    powerUpDuration: 5000,
    webDataSpawnRate: 1500
};
const WEB_DATA_TEMPLATES = [
    { type: 'card', html: '<h2>Data Center</h2><p>Flux de données critique.</p>' },
    { type: 'card', html: '<h2>Proxy</h2><p>Bypass détecté.</p>' },
    { type: 'text', html: '<p>Le système détecte une intrusion massive.</p>' },
    { type: 'list', html: '<ul><li>Cluster A</li><li>Cluster B</li><li>Cluster C</li></ul>' },
    { type: 'warning', html: '<h2>NOYAU</h2><p>Surchauffe imminente.</p>' },
    { type: 'card', html: '<h2>SQL Injection</h2><p>Table users_db compromise.</p>' },
    { type: 'text', html: '<code>Error 500: Internal Server Error</code>' }
];
class Game {
    constructor() {
        var _a;
        this.pseudo = "ANONYME";
        this.rotation = 0;
        this.hp = 100;
        this.score = 0;
        // Gestion des Bonus
        this.weaponMode = WeaponMode.NORMAL;
        this.powerUpTimeout = null;
        this.difficultyFactor = 1.0;
        this.startTime = 0;
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.lastShotTime = 0;
        this.lastEnemySpawnTime = 0;
        this.lastPowerUpSpawnTime = 0;
        this.isRunning = false;
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.targets = [];
        this.powerUps = [];
        this.lastWebDataSpawnTime = 0;
        this.isSoundOn = true;
        this.loop = () => {
            if (!this.isRunning)
                return;
            const now = Date.now();
            this.updateDifficulty();
            if (now - this.lastEnemySpawnTime > CONFIG.baseEnemySpawnRate / this.difficultyFactor) {
                this.spawnEnemy();
                this.lastEnemySpawnTime = now;
            }
            // Apparition des bonus
            if (now - this.lastPowerUpSpawnTime > CONFIG.powerUpSpawnRate) {
                this.spawnPowerUp();
                this.lastPowerUpSpawnTime = now;
            }
            if (now - this.lastWebDataSpawnTime > CONFIG.webDataSpawnRate / (this.difficultyFactor * 0.8)) {
                this.spawnWebData();
                this.lastWebDataSpawnTime = now;
            }
            this.updatePlayer();
            this.updateBullets();
            this.updateEnemyBullets();
            this.updateEnemies();
            this.updateTargets();
            this.checkCollisions();
            this.render();
            requestAnimationFrame(this.loop);
        };
        this.container = document.getElementById('game-container');
        this.scoreEl = document.getElementById('score-val');
        this.hpEl = document.getElementById('hp-val');
        this.difficultyEl = document.getElementById('difficulty-val');
        this.initPlayer();
        this.setupInputs();
        (_a = document.getElementById('start-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            const input = document.getElementById('player-pseudo');
            if (input && input.value.trim() !== "")
                this.pseudo = input.value.substring(0, 12).toUpperCase();
            document.getElementById('start-screen').classList.add('hidden');
            this.convertDomToTargets();
            this.startGame();
        });
        this.muteBtn = document.getElementById('mute-btn');
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => {
                console.log("Click détecté !"); // Vérif dans la console
                this.toggleSound();
            });
        }
    }
    playSound(id, volume = 0.2) {
        console.log(`Tentative de son. Son actif ? ${this.isSoundOn}`);
        if (!this.isSoundOn)
            return;
        const sourceSound = document.getElementById(id);
        if (sourceSound) {
            const soundClone = sourceSound.cloneNode(true);
            soundClone.volume = volume;
            soundClone.play().catch(() => { });
        }
    }
    toggleSound() {
        this.isSoundOn = !this.isSoundOn;
        if (this.isSoundOn) {
            this.muteBtn.innerText = "🔊 SON: ON";
            this.muteBtn.classList.remove('muted');
        }
        else {
            this.muteBtn.innerText = "🔇 SON: OFF";
            this.muteBtn.classList.add('muted');
        }
        this.muteBtn.blur();
    }
    initPlayer() {
        const el = document.createElement('div');
        el.className = 'player-ship';
        this.container.appendChild(el);
        this.player = {
            element: el, pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
            vel: { x: 0, y: 0 }, width: 24, height: 30, active: true
        };
    }
    convertDomToTargets() {
        const source = document.getElementById('website-content');
        if (!source)
            return;
        // On sélectionne les éléments à transformer
        source.querySelectorAll('h1, h2, p, li, .card').forEach((el) => {
            // On récupère la taille "virtuelle" de l'élément
            const rect = el.getBoundingClientRect();
            const div = document.createElement('div');
            div.className = 'target-element';
            // On transfère les classes spécifiques (card, warning) pour garder le style
            if (el.classList.contains('card'))
                div.classList.add('card');
            if (el.classList.contains('warning'))
                div.classList.add('warning');
            div.innerHTML = el.innerHTML;
            // On applique une largeur max pour éviter qu'ils prennent tout l'écran
            div.style.width = 'auto';
            div.style.maxWidth = '250px';
            this.container.appendChild(div);
            // --- CORRECTION DU BUG ---
            // Au lieu de prendre rect.left (qui est toujours à gauche), on génère un X et Y aléatoire
            // On garde une marge de 50px pour ne pas être collé au bord
            const randomX = Math.random() * (window.innerWidth - 100) + 50;
            const randomY = Math.random() * (window.innerHeight - 100) + 50;
            this.targets.push({
                element: div,
                pos: { x: randomX, y: randomY }, // Position forcée aléatoire
                vel: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 }, // Vitesse très lente au début
                width: rect.width || 200, // Largeur par défaut si rect échoue
                height: rect.height || 100,
                active: true
            });
        });
    }
    setupInputs() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
        window.addEventListener('mousedown', () => this.tryShoot());
    }
    startGame() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.lastEnemySpawnTime = Date.now();
        this.lastPowerUpSpawnTime = Date.now();
        this.lastWebDataSpawnTime = Date.now();
        this.loop();
    }
    spawnWebData() {
        // 1. Choisir un modèle aléatoire
        const template = WEB_DATA_TEMPLATES[Math.floor(Math.random() * WEB_DATA_TEMPLATES.length)];
        // 2. Créer l'élément DOM
        const div = document.createElement('div');
        div.className = 'target-element';
        // Ajouter des classes spécifiques (card, warning) pour le CSS
        if (template.type === 'card')
            div.classList.add('card');
        if (template.type === 'warning')
            div.classList.add('warning');
        div.innerHTML = template.html;
        this.container.appendChild(div); // Ajouter au DOM pour calculer sa taille
        // 3. Positionnement (Au bord de l'écran, comme les ennemis)
        // On utilise une logique similaire à "getRandomEdgePos" mais adaptée
        const pos = this.getRandomEdgePos();
        // Calculer la direction (ils traversent l'écran lentement)
        // Ils vont vers le centre de l'écran ou traversent simplement
        const angle = Math.atan2((window.innerHeight / 2) - pos.y, (window.innerWidth / 2) - pos.x);
        // Ajout d'un peu de hasard dans l'angle
        const randomizedAngle = angle + (Math.random() - 0.5);
        const speed = 1 + Math.random(); // Vitesse lente et variable
        // 4. Ajouter à la liste des cibles
        const rect = div.getBoundingClientRect();
        // Ajuster la largeur si nécessaire (par défaut c'est block)
        div.style.width = 'auto';
        this.targets.push({
            element: div,
            pos: pos,
            vel: { x: Math.cos(randomizedAngle) * speed, y: Math.sin(randomizedAngle) * speed },
            width: rect.width, // On récupère la taille réelle du contenu
            height: rect.height,
            active: true
        });
    }
    updateDifficulty() {
        const elapsedSec = (Date.now() - this.startTime) / 1000;
        this.difficultyFactor = 1 + (elapsedSec / 12);
        this.difficultyEl.innerText = "x" + this.difficultyFactor.toFixed(2);
        if (this.difficultyFactor > 2.0) {
            this.difficultyEl.style.color = "red";
            this.difficultyEl.classList.add('blink');
        }
    }
    // ----------------------------------------------------------------
    // LOGIQUE DE SPAWN DES BONUS (OBJETS STATIQUES)
    // ----------------------------------------------------------------
    spawnPowerUp() {
        // 50% de chance d'avoir l'un ou l'autre
        const type = Math.random() > 0.5 ? WeaponMode.SPREAD : WeaponMode.RAPID;
        const el = document.createElement('div');
        // On ajoute les classes CSS pour le style (voir CSS)
        el.className = 'powerup ' + (type === WeaponMode.SPREAD ? 'spread' : 'rapid');
        el.innerText = type === WeaponMode.SPREAD ? '💥' : '⚡';
        this.container.appendChild(el);
        // Position aléatoire DANS l'écran (Marge de 50px pour ne pas être collé au bord)
        const margin = 50;
        const x = Math.random() * (window.innerWidth - (margin * 2)) + margin;
        const y = Math.random() * (window.innerHeight - (margin * 2)) + margin;
        this.powerUps.push({
            element: el,
            pos: { x: x, y: y },
            type: type,
            vel: { x: 0, y: 0 }, // Vitesse = 0, l'objet ne bouge pas, il attend d'être ramassé
            width: 40, height: 40, active: true
        });
    }
    // ----------------------------------------------------------------
    // LOGIQUE DE COLLECTE (COLLISION + TIMER)
    // ----------------------------------------------------------------
    collectPowerUp(p) {
        // 1. On retire l'objet visuel (il est "consommé")
        this.removeEntity(p, this.powerUps);
        // 2. Score et Changement d'arme
        this.score += 250;
        this.weaponMode = p.type;
        // 3. Gestion du Timer (Reset si on en prend un autre avant la fin)
        if (this.powerUpTimeout) {
            clearTimeout(this.powerUpTimeout);
        }
        // 4. Feedback Visuel (Message à l'écran)
        const info = document.createElement('div');
        info.innerText = p.type === WeaponMode.SPREAD ? "DISPERSION ACTIVÉE !" : "TIR RAPIDE ACTIVÉ !";
        info.style.position = 'fixed';
        info.style.top = '30%';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.style.color = p.type === WeaponMode.SPREAD ? 'var(--neon-blue)' : 'var(--neon-yellow)';
        info.style.fontSize = '30px';
        info.style.fontWeight = 'bold';
        info.style.zIndex = '3000';
        info.style.textShadow = '0 0 10px black';
        document.body.appendChild(info);
        setTimeout(() => info.remove(), 1500);
        // 5. Lancer le compte à rebours de 5 secondes
        this.powerUpTimeout = setTimeout(() => {
            this.weaponMode = WeaponMode.NORMAL; // Retour à la normale
            this.powerUpTimeout = null;
            // Petit message de fin d'effet
            const endMsg = document.createElement('div');
            endMsg.innerText = "ARMES NORMALES";
            endMsg.style.position = 'fixed';
            endMsg.style.top = '30%';
            endMsg.style.width = '100%';
            endMsg.style.textAlign = 'center';
            endMsg.style.color = 'white';
            endMsg.style.fontSize = '20px';
            endMsg.style.zIndex = '3000';
            document.body.appendChild(endMsg);
            setTimeout(() => endMsg.remove(), 1000);
        }, CONFIG.powerUpDuration);
        this.updateUI();
    }
    checkCollisions() {
        // Vérification : Joueur touche Bonus
        this.powerUps.forEach(p => {
            if (p.active && this.checkOverlap(this.player, p)) {
                this.collectPowerUp(p);
            }
        });
        // Balles du joueur touchent ennemis ou cibles
        this.bullets.forEach(b => {
            if (!b.active)
                return;
            this.enemies.forEach(e => {
                if (e.active && this.checkOverlap(b, e)) {
                    this.score += Math.floor(100 * this.difficultyFactor);
                    this.removeEntity(e, this.enemies);
                    this.removeEntity(b, this.bullets);
                    this.updateUI();
                }
            });
            this.targets.forEach(t => {
                if (t.active && this.checkOverlap(b, t)) {
                    this.score += 50;
                    this.removeEntity(t, this.targets);
                    this.removeEntity(b, this.bullets);
                    this.updateUI();
                }
            });
        });
        // Balles ennemies touchent joueur
        this.enemyBullets.forEach(eb => {
            if (eb.active && this.checkOverlap(eb, this.player)) {
                this.takeDamage(10);
                this.removeEntity(eb, this.enemyBullets);
            }
        });
    }
    // --- RESTE DU CODE (MOUVEMENT JOUEUR, TIR, ENNEMIS, ETC.) ---
    updatePlayer() {
        const dx = this.mouse.x - this.player.pos.x;
        const dy = this.mouse.y - this.player.pos.y;
        this.rotation = Math.atan2(dy, dx) + Math.PI / 2;
        const accel = { x: 0, y: 0 };
        if (this.keys['KeyW'] || this.keys['ArrowUp'])
            accel.y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown'])
            accel.y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft'])
            accel.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight'])
            accel.x += 1;
        const len = Math.sqrt(accel.x ** 2 + accel.y ** 2);
        if (len > 0) {
            accel.x /= len;
            accel.y /= len;
        }
        this.player.vel.x += accel.x * CONFIG.playerSpeed;
        this.player.vel.y += accel.y * CONFIG.playerSpeed;
        this.player.vel.x *= CONFIG.friction;
        this.player.vel.y *= CONFIG.friction;
        this.player.pos.x += this.player.vel.x;
        this.player.pos.y += this.player.vel.y;
        this.player.pos.x = Math.max(0, Math.min(window.innerWidth, this.player.pos.x));
        this.player.pos.y = Math.max(0, Math.min(window.innerHeight, this.player.pos.y));
    }
    tryShoot() {
        const now = Date.now();
        // Tir rapide = Cadence divisée par 3 (donc 3x plus vite)
        const currentRate = this.weaponMode === WeaponMode.RAPID ? CONFIG.bulletRate / 3 : CONFIG.bulletRate;
        if (now - this.lastShotTime > currentRate && this.isRunning) {
            this.spawnBullet();
            this.lastShotTime = now;
        }
    }
    spawnBullet() {
        const baseAngle = this.rotation - Math.PI / 2;
        switch (this.weaponMode) {
            case WeaponMode.SPREAD:
                // Tir en dispersion : 3 balles
                this.createSingleBullet(baseAngle, 'var(--neon-blue)');
                this.createSingleBullet(baseAngle - 0.25, 'var(--neon-blue)');
                this.createSingleBullet(baseAngle + 0.25, 'var(--neon-blue)');
                break;
            case WeaponMode.RAPID:
                // Tir Rapide : Balles jaunes décalées pour faire "Double canon"
                const offsetX = Math.cos(baseAngle + Math.PI / 2) * 8;
                const offsetY = Math.sin(baseAngle + Math.PI / 2) * 8;
                this.createSingleBullet(baseAngle, 'var(--neon-yellow)', { x: offsetX, y: offsetY });
                this.createSingleBullet(baseAngle, 'var(--neon-yellow)', { x: -offsetX, y: -offsetY });
                break;
            case WeaponMode.NORMAL:
            default:
                this.createSingleBullet(baseAngle, 'white');
                break;
        }
    }
    createSingleBullet(angle, color, offset) {
        const el = document.createElement('div');
        el.className = 'bullet';
        el.style.background = color;
        el.style.boxShadow = `0 0 10px ${color}`;
        this.container.appendChild(el);
        let startX = this.player.pos.x;
        let startY = this.player.pos.y;
        if (offset) {
            startX += offset.x;
            startY += offset.y;
        }
        this.bullets.push({
            element: el, pos: { x: startX, y: startY },
            vel: { x: Math.cos(angle) * CONFIG.bulletSpeed, y: Math.sin(angle) * CONFIG.bulletSpeed },
            width: 6, height: 6, active: true
        });
    }
    spawnEnemy() {
        this.playSound('sfx-spawn', 0.2);
        const el = document.createElement('div');
        el.className = 'enemy';
        this.container.appendChild(el);
        const pos = this.getRandomEdgePos();
        this.enemies.push({
            element: el, pos: pos, vel: { x: 0, y: 0 }, width: 50, height: 50, active: true, lastShot: Date.now()
        });
    }
    getRandomEdgePos() {
        const side = Math.floor(Math.random() * 4);
        if (side === 0)
            return { x: Math.random() * window.innerWidth, y: -50 };
        if (side === 1)
            return { x: window.innerWidth + 50, y: Math.random() * window.innerHeight };
        if (side === 2)
            return { x: Math.random() * window.innerWidth, y: window.innerHeight + 50 };
        return { x: -50, y: Math.random() * window.innerHeight };
    }
    updateEnemies() {
        const currentSpeed = CONFIG.baseEnemySpeed * this.difficultyFactor;
        const shootRate = CONFIG.baseEnemyShootRate / this.difficultyFactor;
        const now = Date.now();
        this.enemies.forEach(en => {
            const angle = Math.atan2(this.player.pos.y - en.pos.y, this.player.pos.x - en.pos.x);
            en.vel.x = Math.cos(angle) * currentSpeed;
            en.vel.y = Math.sin(angle) * currentSpeed;
            en.pos.x += en.vel.x;
            en.pos.y += en.vel.y;
            if (en.lastShot !== undefined && now - en.lastShot > shootRate) {
                this.spawnEnemyBullet(en);
                en.lastShot = now;
            }
            if (this.checkOverlap(en, this.player)) {
                this.takeDamage(15);
                this.removeEntity(en, this.enemies);
            }
        });
    }
    spawnEnemyBullet(enemy) {
        const el = document.createElement('div');
        el.className = 'enemy-bullet';
        this.container.appendChild(el);
        const angle = Math.atan2(this.player.pos.y - enemy.pos.y, this.player.pos.x - enemy.pos.x);
        const speed = CONFIG.enemyBulletSpeed * (1 + (this.difficultyFactor * 0.1));
        this.enemyBullets.push({
            element: el, pos: { x: enemy.pos.x + 25, y: enemy.pos.y + 25 },
            vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }, width: 8, height: 8, active: true
        });
    }
    updateEnemyBullets() {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const b = this.enemyBullets[i];
            b.pos.x += b.vel.x;
            b.pos.y += b.vel.y;
            if (this.isOffscreen(b))
                this.removeEntity(b, this.enemyBullets);
        }
    }
    updateTargets() { this.updateFloatingEntities(this.targets); }
    updateFloatingEntities(list) {
        list.forEach(t => {
            t.pos.x += t.vel.x;
            t.pos.y += t.vel.y;
            if (t.pos.x < -100)
                t.pos.x = window.innerWidth + 100;
            else if (t.pos.x > window.innerWidth + 100)
                t.pos.x = -100;
            if (t.pos.y < -100)
                t.pos.y = window.innerHeight + 100;
            else if (t.pos.y > window.innerHeight + 100)
                t.pos.y = -100;
        });
    }
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.pos.x += b.vel.x;
            b.pos.y += b.vel.y;
            if (this.isOffscreen(b))
                this.removeEntity(b, this.bullets);
        }
    }
    checkOverlap(a, b) {
        return (a.pos.x < b.pos.x + b.width && a.pos.x + a.width > b.pos.x && a.pos.y < b.pos.y + b.height && a.pos.y + a.height > b.pos.y);
    }
    isOffscreen(obj) {
        return (obj.pos.x < -100 || obj.pos.x > window.innerWidth + 100 || obj.pos.y < -100 || obj.pos.y > window.innerHeight + 100);
    }
    removeEntity(obj, list) {
        obj.active = false;
        obj.element.remove();
        const idx = list.indexOf(obj);
        if (idx > -1)
            list.splice(idx, 1);
    }
    takeDamage(amount) {
        this.hp -= amount;
        this.container.style.boxShadow = "inset 0 0 50px red";
        setTimeout(() => this.container.style.boxShadow = "none", 100);
        if (this.hp <= 0)
            this.gameOver();
        this.updateUI();
    }
    updateUI() {
        this.scoreEl.innerText = this.score.toString();
        this.hpEl.innerText = Math.max(0, this.hp) + "%";
        if (this.hp < 30)
            this.hpEl.style.color = 'red';
        else
            this.hpEl.style.color = 'var(--neon-green)';
    }
    render() {
        this.player.element.style.transform = `translate(${this.player.pos.x}px, ${this.player.pos.y}px) rotate(${this.rotation}rad)`;
        [this.bullets, this.enemyBullets, this.enemies, this.targets, this.powerUps].forEach(list => {
            list.forEach(obj => obj.element.style.transform = `translate(${obj.pos.x}px, ${obj.pos.y}px)`);
        });
    }
    saveAndLoadScores() {
        const STORAGE_KEY = 'dom-blaster-scores';
        const existingData = localStorage.getItem(STORAGE_KEY);
        let scores = existingData ? JSON.parse(existingData) : [];
        // 1. Ajouter le nouveau score
        scores.push({
            name: this.pseudo,
            score: this.score,
            // On utilise le format YYYY-MM-DD pour que le tri par date du Dashboard fonctionne parfaitement
            date: new Date().toISOString().split('T')[0]
        });
        // ---------------------------------------------------------
        // LA LIGNE MANQUANTE ETAIT ICI !
        // On renvoie les données dans la mémoire du navigateur
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        // ---------------------------------------------------------
        // 3. Trier pour l'affichage (Meilleur score en premier)
        scores.sort((a, b) => b.score - a.score);
        // On retourne le top 5 pour l'écran de Game Over
        return scores.slice(0, 5);
    }
    gameOver() {
        this.isRunning = false;
        if (this.powerUpTimeout)
            clearTimeout(this.powerUpTimeout);
        const modal = document.getElementById('game-over-modal');
        const msg = document.getElementById('final-score-msg');
        const list = document.getElementById('leaderboard-list');
        if (modal && msg && list) {
            modal.classList.remove('hidden');
            msg.innerText = `PILOTE : ${this.pseudo} | SCORE : ${this.score}`;
            const topScores = this.saveAndLoadScores();
            list.innerHTML = "";
            topScores.forEach((s, i) => {
                const isMe = (s.name === this.pseudo && s.score === this.score);
                list.innerHTML += `<li style="${isMe ? 'color:yellow; font-weight:bold' : ''}"><span>#${i + 1} ${s.name}</span><span>${s.score}pts</span></li>`;
            });
        }
    }
}
window.addEventListener('load', () => new Game());
export {};
//# sourceMappingURL=laserGameLogic.js.map