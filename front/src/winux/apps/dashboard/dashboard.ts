// Déclaration pour que TS ne râle pas sur Chart.js importé via CDN
declare const Chart: any;

interface HighScore {
    name: string;
    score: number;
    date: string;
}

export class Dashboard {
    private readonly STORAGE_KEY = 'dom-blaster-scores';

    constructor() {
        this.init();
        document.getElementById('btn-purge')?.addEventListener('click', () => this.resetData());
    }

    private init() {
        const rawData = localStorage.getItem(this.STORAGE_KEY);
        if (!rawData) {
            console.log("Aucune donnée trouvée.");
            return;
        }

        let scores: HighScore[] = JSON.parse(rawData);
        
        // Tri par score décroissant pour le classement
        scores.sort((a, b) => b.score - a.score);

        this.updateKPIs(scores);
        this.updateTable(scores);
        this.initCharts(scores);
    }

    private updateKPIs(scores: HighScore[]) {
        if (scores.length === 0) return;

        const highScore = scores[0].score;
        const totalGames = scores.length;
        const totalScore = scores.reduce((sum, item) => sum + item.score, 0);
        const avgScore = Math.floor(totalScore / totalGames);
        const topPlayer = scores[0].name;

        this.setElementText('kpi-high', highScore.toLocaleString());
        this.setElementText('kpi-count', totalGames.toString());
        this.setElementText('kpi-avg', avgScore.toLocaleString());
        this.setElementText('kpi-top-player', topPlayer);
    }

    private setElementText(id: string, text: string) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    private updateTable(scores: HighScore[]) {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // On affiche max 10 entrées
        const displayScores = scores.slice(0, 10);

        displayScores.forEach((s, index) => {
            const tr = document.createElement('tr');
            tr.className = `rank-${index + 1}`;
            
            // Sécurisation basique du nom
            const safeName = s.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            tr.innerHTML = `
                <td><span class="rank-badge">${index + 1}</span></td>
                <td style="font-weight:bold; color: white;">${safeName}</td>
                <td style="color: var(--primary);">${s.score.toLocaleString()}</td>
                <td style="color: var(--text-muted);">${s.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    private initCharts(scores: HighScore[]) {
        // Pour la courbe de progression, on veut l'ordre chronologique
        // On clone le tableau pour ne pas casser le tri du classement
        let chronological = [...scores].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-20); 

        const labels = chronological.map((s, i) => `Partie ${i+1}`);
        const dataScores = chronological.map(s => s.score);

        // --- GRAPHIQUE 1 : LIGNE (Progression) ---
        const ctx1 = (document.getElementById('scoreChart') as HTMLCanvasElement).getContext('2d');
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Évolution des Scores',
                    data: dataScores,
                    borderColor: '#00f7ff',
                    backgroundColor: 'rgba(0, 247, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.4, 
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, title: { display: true, text: 'Progression Récente', color: '#fff' } },
                scales: {
                    y: { grid: { color: '#333' }, ticks: { color: '#aaa' } },
                    x: { grid: { display: false }, ticks: { display: false } }
                }
            }
        });

        // --- GRAPHIQUE 2 : BARRES (Top 5 Joueurs) ---
        const top5 = scores.slice(0, 5);
        const ctx2 = (document.getElementById('barChart') as HTMLCanvasElement).getContext('2d');
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: top5.map(s => s.name),
                datasets: [{
                    label: 'Score',
                    data: top5.map(s => s.score),
                    backgroundColor: ['#00f7ff', '#00e0e6', '#00cacc', '#00b3b3', '#009d9d'],
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, title: { display: true, text: 'Top 5 Pilotes', color: '#fff' } },
                scales: { y: { grid: { color: '#333' }, ticks: { color: '#aaa' } }, x: { ticks: { color: '#fff' } } }
            }
        });
    }

    private resetData() {
        if(confirm("Confirmer la suppression complète des archives ?")) {
            localStorage.removeItem(this.STORAGE_KEY);
            location.reload();
        }
    }
}

// Initialisation au chargement de la page
window.addEventListener('load', () => {
    new Dashboard();
});