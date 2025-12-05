let rien = 0;
let mur = 1;

let joueur = 3;
let haut = 2;
let droite = 3;
let bas = 4;
let gauche = 5;

let bot = 9;
let bhaut = 6;
let bdroite = 7;
let bbas = 8;
let bgauche = 9;

let joueurLigne = Math.floor(Math.random() * 8) + 2;
let joueurColone = Math.floor(Math.random() * 8) + 2;
let botLigne = Math.floor(Math.random() * 8) + 2;
let botColone = Math.floor(Math.random() * 8) + 2;

const grid = generateGrid(12);
let botMouv = null;
document.addEventListener("keydown", mouvement);

document.getElementById("verifyButton").addEventListener("click", function () {
	const captchaContainer = document.querySelector(".captcha-container");
	document.getElementById("verifyButton").style.display = "none";

	captchaContainer.classList.add("captcha-expanded");
	drawAssets();
	botMouv = setInterval(deplacementBot, 1000);
});

function creationTableau(nbLigne) {
	let Tableau = [];
	for (let i = 0; i < nbLigne; i++) {
		let ligne = [];
		for (let j = 0; j < nbLigne; j++) {
			ligne.push(0);
		}
		Tableau.push(ligne);
	}
	return Tableau;
}

function apparitionJoueur(Tableau) {
	Tableau[joueurLigne][joueurColone] = joueur;
	if (Tableau[botLigne][botColone] == 0) {
		Tableau[botLigne][botColone] = bot;
	} else {
		botLigne = Math.floor(Math.random() * 8) + 2;
		botColone = Math.floor(Math.random() * 8) + 2;
		apparitionJoueur(Tableau);
	}
}

function bordure(Tableau) {
	for (let i = 0; i < Tableau.length; i++) {
		Tableau[0][i] = 1;
		Tableau[Tableau.length - 1][i] = 1;
		Tableau[i][0] = 1;
		Tableau[i][Tableau.length - 1] = 1;
	}
}

function apparitionMur(Tableau, nbLigne) {
	nbMur = Math.floor(Math.random() * 5) + 15;
	for (let i = 0; i < nbMur; i++) {
		ligne = Math.floor(Math.random() * (nbLigne - 3)) + 2;
		colone = Math.floor(Math.random() * (nbLigne - 3)) + 2;
		if (Tableau[ligne][colone] != (bot && joueur)) {
			Tableau[ligne][colone] = 1;
		}
	}
}

function generateGrid(nbLigne) {
	let Tableau = creationTableau(nbLigne);
	bordure(Tableau);
	apparitionMur(Tableau, nbLigne);
	apparitionJoueur(Tableau);
	return Tableau;
}

function drawAssets() {
	const child = document.getElementById("game-cell"); // Sélectionnez l'élément à supprimer

	const gameGrid = document.getElementById("gameGrid");
	gameGrid.replaceChildren();

	for (let i = 0; i < 12 * 12; i++) {
		const cell = document.createElement("div");
		cell.classList.add("game-cell");

		const row = Math.floor(i / 12);
		const col = i % 12;
		const cellValue = grid[row][col];

		if (cellValue === 1) {
			cell.style.backgroundImage = "url('../assets/wall.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 2) {
			cell.style.backgroundImage = "url('../assets/tankgreen-up.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 3) {
			cell.style.backgroundImage = "url('../assets/tankgreen-right.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 4) {
			cell.style.backgroundImage = "url('../assets/tankgreen-down.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 5) {
			cell.style.backgroundImage = "url('../assets/tankgreen-left.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 6) {
			cell.style.backgroundImage = "url('../assets/tankred-up.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 7) {
			cell.style.backgroundImage = "url('../assets/tankred-right.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 8) {
			cell.style.backgroundImage = "url('../assets/tankred-down.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 9) {
			cell.style.backgroundImage = "url('../assets/tankred-left.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 20) {
			cell.style.backgroundImage = "url('../assets/bullet-up.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 21) {
			cell.style.backgroundImage = "url('../assets/bullet-right.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 22) {
			cell.style.backgroundImage = "url('../assets/bullet-down.png')";
			cell.style.backgroundSize = "cover";
		} else if (cellValue === 23) {
			cell.style.backgroundImage = "url('../assets/bullet-left.png')";
			cell.style.backgroundSize = "cover";
		} else {
			cell.style.backgroundImage = "url('../assets/floor.png')";
			cell.style.backgroundSize = "cover";
		}

		gameGrid.appendChild(cell);
	}
}

function mouvement(event) {
	if (event.key === "z" || event.key === "ArrowUp") {
		avance(grid);
	} else if (event.key === "q" || event.key === "ArrowLeft") {
		Gauche(grid);
	} else if (event.key === "d" || event.key === "ArrowRight") {
		Droite(grid);
	} else if (event.key === " ") {
		tire(grid);
	}
	drawAssets();
}

function attente(callback, time) {
	setTimeout(callback, time);
}

function Gauche(grid) {
	if (grid[joueurLigne][joueurColone] == haut) {
		grid[joueurLigne][joueurColone] = gauche;
	} else {
		grid[joueurLigne][joueurColone] = grid[joueurLigne][joueurColone] - 1;
	}
}

function Droite(grid) {
	if (grid[joueurLigne][joueurColone] == gauche) {
		grid[joueurLigne][joueurColone] = haut;
	} else {
		grid[joueurLigne][joueurColone] = grid[joueurLigne][joueurColone] + 1;
	}
}

function avance(grid) {
	if (grid[joueurLigne][joueurColone] == haut) {
		if (grid[joueurLigne - 1][joueurColone] == 0) {
			grid[joueurLigne - 1][joueurColone] = haut;
			grid[joueurLigne][joueurColone] = 0;
			joueurLigne = joueurLigne - 1;
		}
	} else if (grid[joueurLigne][joueurColone] == droite) {
		if (grid[joueurLigne][joueurColone + 1] == 0) {
			grid[joueurLigne][joueurColone + 1] = droite;
			grid[joueurLigne][joueurColone] = 0;
			joueurColone = joueurColone + 1;
		}
	} else if (grid[joueurLigne][joueurColone] == bas) {
		if (grid[joueurLigne + 1][joueurColone] == 0) {
			grid[joueurLigne + 1][joueurColone] = bas;
			grid[joueurLigne][joueurColone] = 0;
			joueurLigne = joueurLigne + 1;
		}
	} else {
		if (grid[joueurLigne][joueurColone - 1] == 0) {
			grid[joueurLigne][joueurColone - 1] = gauche;
			grid[joueurLigne][joueurColone] = 0;
			joueurColone = joueurColone - 1;
		}
	}
}

async function tire(Tableau) {
	let balleLigne = joueurLigne;
	let balleColone = joueurColone;
	let direction = Tableau[balleLigne][balleColone];
	let deltas = { haut: [-1, 0], droite: [0, 1], bas: [1, 0], gauche: [0, -1] };

	let [dLigne, dColone] = direction === haut ? deltas.haut : direction === droite ? deltas.droite : direction === bas ? deltas.bas : deltas.gauche;

	balleLigne += dLigne;
	balleColone += dColone;

	if (Tableau[balleLigne][balleColone] === 0) {
		await deplacerBalle(Tableau, balleLigne, balleColone, direction);
	} else if (Tableau[balleLigne][balleColone] === bot) {
		winGame();
	}
}

async function deplacerBalle(Tableau, ligne, colone, direction) {
	let sprite = direction === haut ? 20 : direction === droite ? 21 : direction === bas ? 22 : 23;

	while (Tableau[ligne] && Tableau[ligne][colone] === 0) {
		Tableau[ligne][colone] = sprite;
		drawAssets();
		await delay(200);

		Tableau[ligne][colone] = 0;
		ligne += direction === haut ? -1 : direction === bas ? 1 : 0;
		colone += direction === gauche ? -1 : direction === droite ? 1 : 0;
	}
	if (Tableau[ligne][colone] === bot) {
		winGame();
	}
	ligne += direction === haut ? 1 : direction === bas ? -1 : 0;
	colone += direction === gauche ? 1 : direction === droite ? -1 : 0;
	Tableau[ligne][colone] = 0;
	drawAssets();
}

function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

function deplacementBot() {
	const actions = ["tournerGauche", "tournerDroite", "avancer", "avancer", "avancer", "avancer"];
	const action = actions[Math.floor(Math.random() * actions.length)];

	if (action === "tournerGauche") {
		if (grid[botLigne][botColone] === haut) {
			grid[botLigne][botColone] = gauche;
		} else if (grid[botLigne][botColone] === gauche) {
			grid[botLigne][botColone] = bas;
		} else if (grid[botLigne][botColone] === bas) {
			grid[botLigne][botColone] = droite;
		} else if (grid[botLigne][botColone] === droite) {
			grid[botLigne][botColone] = haut;
		}
		bot = grid[botLigne][botColone];
		tournerGaucheBot(grid);
	} else if (action === "tournerDroite") {
		if (grid[botLigne][botColone] === haut) {
			grid[botLigne][botColone] = droite;
		} else if (grid[botLigne][botColone] === droite) {
			grid[botLigne][botColone] = bas;
		} else if (grid[botLigne][botColone] === bas) {
			grid[botLigne][botColone] = gauche;
		} else if (grid[botLigne][botColone] === gauche) {
			grid[botLigne][botColone] = haut;
		}
		bot = grid[botLigne][botColone];
		tournerDroiteBot(grid);
	} else if (action === "avancer") {
		let direction = grid[botLigne][botColone];
		let dLigne = 0,
			dColone = 0;

		if (direction === haut) dLigne = -1;
		else if (direction === droite) dColone = 1;
		else if (direction === bas) dLigne = 1;
		else if (direction === gauche) dColone = -1;

		let nextLigne = botLigne + dLigne;
		let nextColone = botColone + dColone;

		if (grid[nextLigne][nextColone] === 0) {
			grid[nextLigne][nextColone] = direction;
			grid[botLigne][botColone] = 0;
			botLigne = nextLigne;
			botColone = nextColone;
		}
		avancerBot(grid);
	}

	bot = grid[botLigne][botColone];

	drawAssets();
}

function tournerGaucheBot(grid) {
	if (grid[botLigne][botColone] === bhaut) {
		grid[botLigne][botColone] = bgauche;
	} else {
		grid[botLigne][botColone] -= 1;
	}
}

function tournerDroiteBot(grid) {
	if (grid[botLigne][botColone] === bgauche) {
		grid[botLigne][botColone] = bhaut;
	} else {
		grid[botLigne][botColone] += 1;
	}
}

function avancerBot(grid) {
	let direction = grid[botLigne][botColone];
	let nextLigne = botLigne;
	let nextColone = botColone;

	if (direction === bhaut) {
		nextLigne -= 1;
	} else if (direction === bdroite) {
		nextColone += 1;
	} else if (direction === bbas) {
		nextLigne += 1;
	} else if (direction === bgauche) {
		nextColone -= 1;
	}

	if (grid[nextLigne][nextColone] === rien) {
		// Vérifie que la case suivante est vide
		grid[nextLigne][nextColone] = direction;
		grid[botLigne][botColone] = rien;
		botLigne = nextLigne;
		botColone = nextColone;
	}
}

function winGame() {
	// const captcha = document.getElementsByClassName('captcha-container')[0];
	// const site = document.getElementById('site');
	// captcha.style.display = 'none';
	// site.style.display = 'block';
	window.parent.postMessage("captchaSolved", "*");
}
