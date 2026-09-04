const board = document.querySelector("#board");
const form = document.querySelector("#guess-form");
const input = document.querySelector("#guess");
const message = document.querySelector("#message");
const attemptCount = document.querySelector("#attempt-count");
const answerPanel = document.querySelector("#answer-panel");
const answerLabel = document.querySelector("#answer-label");
const answer = document.querySelector("#answer");
const resetButton = document.querySelector("#reset-button");
const keyboard = document.querySelector(".keyboard");

const fallbackWords = ["apple", "beach", "blaze", "brave", "bread", "brick", "cabin", "candy", "chair", "charm", "chase", "cloud", "crown", "dance", "dream", "eagle", "earth", "flame", "flash", "flute", "fruit", "giant", "globe", "grape", "grass", "green", "heart", "honey", "house", "jelly", "knife", "lemon", "light", "magic", "maple", "metal", "money", "mouse", "music", "ocean", "olive", "orbit", "otter", "panda", "peach", "pearl", "piano", "pilot", "plant", "plaza", "pride", "queen", "quiet", "raven", "river", "robot", "robin", "rough", "round", "royal", "scale", "scarf", "shark", "sheep", "shine", "shore", "skate", "skull", "slate", "smile", "snail", "snake", "spice", "spoon", "sport", "stack", "steam", "stone", "storm", "sugar", "table", "tiger", "toast", "token", "tower", "train", "treat", "truck", "tulip", "uncle", "vivid", "whale", "wheat", "world", "zebra"];

let words = fallbackWords;
let target = "";
let guesses = [];
let graywords = [];
let letterStatuses = {};

function chooseWord() {
	return words[Math.floor(Math.random() * words.length)];
}

function getStatuses(guess) {
	const statuses = Array(5).fill("absent");
	const remaining = target.split("");

	for (let index = 0; index < 5; index += 1) {
		if (guess[index] === target[index]) {
			statuses[index] = "correct";
			remaining[index] = null;
		}
	}
	for (let index = 0; index < 5; index += 1) {
		if (statuses[index] === "correct") continue;
		const match = remaining.indexOf(guess[index]);
		if (match !== -1) {
			statuses[index] = "present";
			remaining[match] = null;
		}
	}
	return statuses;
}

function renderBoard() {
	board.replaceChildren();
	guesses.forEach((entry, rowIndex) => {
		const row = document.createElement("div");
		row.className = "guess-row submitted";
		row.setAttribute("aria-label", `Guess ${rowIndex + 1}: ${entry.word}`);
		entry.word.split("").forEach((letter, index) => {
			const tile = document.createElement("span");
			tile.className = `tile ${entry.statuses[index]}`;
			tile.textContent = letter.toUpperCase();
			row.append(tile);
		});
		board.append(row);
	});
	for (let rowIndex = guesses.length; rowIndex < 6; rowIndex += 1) {
		const row = document.createElement("div");
		row.className = "guess-row";
		row.setAttribute("aria-hidden", "true");
		for (let tileIndex = 0; tileIndex < 5; tileIndex += 1) {
			const tile = document.createElement("span");
			tile.className = "tile empty";
			row.append(tile);
		}
		board.append(row);
	}
	attemptCount.textContent = guesses.length;
}

function renderKeyboard() {
	keyboard.querySelectorAll(".key").forEach((key) => {
		const status = letterStatuses[key.dataset.letter];
		key.classList.remove("correct", "present", "absent");
		if (status) key.classList.add(status);
	});
}

function updateLetterStatuses(guess, statuses) {
	const priority = { absent: 1, present: 2, correct: 3 };
	guess.split("").forEach((letter, index) => {
		const status = statuses[index];
		if (!letterStatuses[letter] || priority[status] > priority[letterStatuses[letter]]) {
			letterStatuses[letter] = status;
		}
		if (status === "absent" && !graywords.includes(letter)) graywords.push(letter);
	});
	renderKeyboard();
}

function showMessage(text, isGameOver = false) {
	message.textContent = text;
	message.hidden = !text;
	message.classList.toggle("game-over-message", isGameOver);
}

function finishGame(won) {
	form.hidden = true;
	answerPanel.hidden = false;
	answerLabel.textContent = won ? `Solved in ${guesses.length} tries` : "The answer was";
	answer.textContent = target.toUpperCase();
	if (!won) showMessage(`Game over. The word was ${target.toUpperCase()}.`, true);
}

function resetGame() {
	target = chooseWord();
	guesses = [];
	graywords = [];
	letterStatuses = {};
	form.hidden = false;
	answerPanel.hidden = true;
	showMessage("");
	input.value = "";
	input.disabled = false;
	renderBoard();
	renderKeyboard();
	input.focus();
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const guess = input.value.trim().toLowerCase();
	if (!/^[a-z]{5}$/.test(guess)) {
		showMessage("Your guess must be exactly five letters.");
		return;
	}
	if (!words.includes(guess)) {
		showMessage("Your guess is not a valid word. Please try again.");
		return;
	}

	const statuses = getStatuses(guess);
	guesses.push({ word: guess, statuses });
	updateLetterStatuses(guess, statuses);
	renderBoard();
	input.value = "";
	const won = guess === target;
	if (won) {
		showMessage("Congratulations! You've guessed the word correctly!", true);
		finishGame(true);
	} else if (guesses.length === 6) {
		finishGame(false);
	}
});

resetButton.addEventListener("click", resetGame);

keyboard.addEventListener("click", (event) => {
	const key = event.target.closest(".key");
	if (!key || input.disabled || input.value.length >= 5) return;
	input.value += key.dataset.letter;
	input.focus();
});

fetch("five_letter_words.txt")
	.then((response) => response.ok ? response.text() : "")
	.then((text) => {
		const localWords = text.split(/\s+/).map((word) => word.toLowerCase()).filter((word) => /^[a-z]{5}$/.test(word));
		if (localWords.length) words = [...new Set([...fallbackWords, ...localWords])];
		resetGame();
	})
	.catch(() => resetGame());