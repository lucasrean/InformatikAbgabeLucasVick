/*
	tic tac toe board
	[ 0,1,2
	  3,4,5
	  6,7,8 ]

*/

var winningConditions = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6]
]

// global variables
var currentBoard; // status des boards
var turn; // welcher zug?
var player; // wer ist dran -  "x" oder "o"
var opponent; // wer ist der gegner - "computer" oder "friend"

function reset() {
	// reset board
	currentBoard = ["","","","","","","","",""];
	turn = 0;
	hideOptions(false); // show options
	document.getElementById('reset').addEventListener('click',reset); // wenn reset element geklickt wird, führe reset function aus
	document.getElementById('start').addEventListener('click',start); // wenn start element geklickt wird, führe start function aus
	document.getElementById('winner').innerHTML = ""; // leeres winner element
	for (i=0;i<=8;i++) {
		// wir laufen durch jedes element des boards
		var file = document.getElementById(i);
		// und machen es leer
		file.innerHTML = "";
		// und nicht mehr klickbar
		file.removeEventListener("click", playerTurn);
	}
}

function start() {
	// ausgewählte optionen global setzen
	player = document.querySelector('input[name="starter"]:checked').value;
	opponent = document.querySelector('input[name="opponent"]:checked').value;
	hideOptions(true); 
	// wir gehen wieder durch alle felder und setzen einen event listener
	for (i=0;i<=8;i++) {
		var file = document.getElementById(i);
		file.addEventListener("click", playerTurn);
	}
	// wenn der computer der gegner ist und auch der starter (player=o)
	if (opponent == "computer" && player == "o") {
		computerTurn();
	}
}

function playerTurn(click) {
	// click pointer wird automatisch an playerTurn übergeben
	// und ich kann mit srcElement direkt auf das geklickte Element zugreifen
	// die id brauch ich um zu wissen, welches feld ich als nächstes ankreuzen muss
	var file = parseInt(click.srcElement.id);
	eachTurn(file);
}

function computerTurn() {
	// da der computer kein click event hat, muss ich bei einem computer turn
	// selbst den besten move finden und als nummer an eachTurn übergeben
	var file = findBestMove(); // 2
	eachTurn(file);
}

function eachTurn(file) {
	// draw mark
	var f = document.getElementById(file)
	f.innerHTML = player.toUpperCase(); // player ist x oder o (upperCase = X oder O)
	// remove option to click
	f.removeEventListener("click", playerTurn);
	// update board                   0   1  2  3 4  5  6  7  8
	currentBoard[file] = player; // ["x","","","","","","","",""];
	// status
	var currentFiles = getCurrentFilesFor(player); // erstmal die X/O's holen die für den derzeitigen Spieler gesetzt sind
	var status = checkStatus(currentFiles); // gucken, ob es einen Gewinner gibt, ein Unentschieden, oder ob es weitergeht. Wir übergeben die currentFiles!
	if (status == "undecided") {
		// wenn es keinen Gewinner oder Unentschieden gibt, machen wir weiter
		changePlayer(); // ändern den Spieler (von X zu O)
		turn++; // erhöhen den Zug
		// und Checken ob der Computer weitermachen muss, oder wir auf den nächsten Click warten
		if (opponent == "computer" && player == "o") {
			computerTurn();
		}
	} else {
		// wenn es einen Gewinner oder Unentschieden gibt, beende das Spiel
		end(status);
	}
}

function getCurrentFilesFor(player) {
	// leeres Array in das wir reinpushen können
	var files = [];
	// den derzeitigen Status des Boards checken
	// Wo sind die X/O's gesetzt des jeweiligen Spielers
	for (i=0;i<=8;i++) {
		// ["x","","","x","","","","x",""];
		if (currentBoard[i] == player) {
			files.push(i);
		}
	}
	// files [0,3,7]
	return files;
}


function checkStatus(files) {
	for (winningCondition of winningConditions) {
		// files = [0,3,6,7]
		// winningCondition = [0,3,6]
		// every checkt jeder nummer im array, ob sie die funktion dahinter erfüllt
		// die funktion ist files.includes(f), was bedeutet: Inkludiert das files Array die Nummer aus den Winning Conditions
		var win = winningCondition.every(function(f) { return files.includes(f)});
		// win = true 
		if (win == true) {
			return "win";
		}
	}
	// es gibt kein gewinner
	if (turn == 8) {
		return "tie";
	}
	// weder win noch tie =
	return "undecided";
}

function changePlayer() {
	// global das player mark ändern
	if (player == "x") {
		player = "o";
	} else {
		player = "x";
	}
}

function findBestMove() {
	// derzeitiger spieler ist der computer
	var computerMark = player;
	// der gegener hat das andere mark
	if (computerMark == "x") {
		var playerMark = "o";	
	} else {
		var playerMark = "x";
	}
	// welche felder sind noch übrig?
	var remainingFiles = getRemainingFiles();
	// und was hat der computer für felder`
	var currentComputerFiles = getCurrentFilesFor(computerMark);
	// und was hat der spieler für felder
	var currentPlayerFiles = getCurrentFilesFor(playerMark);
	
	// check if computer can win
	// remainingFiles = [2,3]
	// currentComputerFiles [0,1]
	for (remainingFile of remainingFiles) {
		// remainingFile = 2
		var potentialFiles = currentComputerFiles.slice(); // copy of array
		// potentialFiles = [0,1]
		potentialFiles.push(remainingFile);
		// potientialFiles = [0,1,2]
		if (checkStatus(potentialFiles) == "win") {
			// gebe ich das remainingFile zurück, dass ich mir gerade angucke
			// 2
			return remainingFile;
		} 
	}
	// hier habe ich leider keinen möglichen gewinn gefunden
	// check if player can win
	for (remainingFile of remainingFiles) {
		var potentialFiles = currentPlayerFiles.slice(); 
		potentialFiles.push(remainingFile);
		if (checkStatus(potentialFiles) == "win") {
			// vereitele den gewinn von deinem gegner
			return remainingFile;
		}
	}
	// keinen tollen move gefunden
	// if for nothing better we choose one randomly
	return remainingFiles[Math.floor(Math.random() * remainingFiles.length)];
}

function getRemainingFiles() {
	// leeres array
	var remainingFiles = []
	for (i=0;i<=8;i++) {
		// gehen durch das ganze board
		// und checken, ob felder noch nicht belegt sind (== "")
		if (currentBoard[i] == "") {
			remainingFiles.push(i);
		}
	}
	return remainingFiles; // was ist noch übrig
}

function end(status) {
	// keine clicks mehr möglich! alle event handler löschen
	for (i=0;i<=8;i++) {
		var file = document.getElementById(i);
		file.removeEventListener("click", playerTurn);
	}
	// und den winner announcer
	var announcement = document.getElementById("winner");
	if (status == "win") {
		announcement.innerHTML = player.toUpperCase() + " has won!"
	} else {
		announcement.innerHTML = "It's a Tie!"
	}
}

function hideOptions(bool) {
	// alle radio buttons hiden oder showen
	var radioButtons = document.querySelectorAll('input[type=radio]')
	for (radioButton of radioButtons) {
		radioButton.disabled = bool;
	}
	// und start hiden oder showen
	document.getElementById('start').disabled = bool;
	// und reset showen oder hiden
	document.getElementById('reset').disabled = !bool; // !true
}

reset();
