let score = 0;
let coins = 0;
let timeLeft = 30;
let gameRunning = false;
let timer;

let skinIndex = 0;

const skins = ["red", "blue", "green", "gold", "purple"];
let ownedSkins = [true, false, false, false, false];

const prices = [0, 50, 100, 200, 300];

const gameArea = document.getElementById("gameArea");

const scoreEl = document.getElementById("score");
const coinEl = document.getElementById("coins");
const timeEl = document.getElementById("time");
const powerEl = document.getElementById("power");

/* -----------------------
   SAVE SYSTEM
------------------------*/
function save() {
    localStorage.setItem("seraphyx_coins", coins);
    localStorage.setItem("seraphyx_skins", JSON.stringify(ownedSkins));
}

function load() {
    coins = parseInt(localStorage.getItem("seraphyx_coins")) || 0;
    ownedSkins = JSON.parse(localStorage.getItem("seraphyx_skins")) || ownedSkins;

    coinEl.textContent = coins;
}

load();

/* -----------------------
   SOUND
------------------------*/
function sound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.connect(g);
    g.connect(ctx.destination);

    if (type === "hit") o.frequency.value = 600;
    if (type === "coin") o.frequency.value = 900;

    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
}

/* -----------------------
   SPAWN TARGET
------------------------*/
function spawn() {
    const t = document.createElement("div");
    t.classList.add("target", skins[skinIndex]);

    const x = Math.random() * (gameArea.clientWidth - 50);
    const y = Math.random() * (gameArea.clientHeight - 50);

    t.style.left = x + "px";
    t.style.top = y + "px";

    t.onclick = () => {
        if (!gameRunning) return;

        score++;
        coins++;

        scoreEl.textContent = score;
        coinEl.textContent = coins;

        sound("hit");
        save();

        showPopup("+1");

        t.remove();
        spawn();
    };

    gameArea.appendChild(t);
}

/* -----------------------
   POPUP ANIMATION
------------------------*/
function showPopup(text) {
    const p = document.createElement("div");
    p.className = "popup";
    p.textContent = text;

    p.style.left = Math.random() * 80 + "%";
    p.style.top = Math.random() * 80 + "%";

    gameArea.appendChild(p);

    setTimeout(() => p.remove(), 800);
}

/* -----------------------
   GAME LOOP
------------------------*/
function startGame() {
    score = 0;
    timeLeft = 30;
    gameRunning = true;

    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;

    gameArea.innerHTML = "";
    spawn();

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;

        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    gameRunning = false;
    clearInterval(timer);
    gameArea.innerHTML = "";
    alert("⚔ Game Over! Score: " + score);
}

/* -----------------------
   SKIN SYSTEM
------------------------*/
function changeSkin() {
    skinIndex = (skinIndex + 1) % skins.length;
}

/* -----------------------
   SHOP SYSTEM
------------------------*/
function openShop() {
    let text = "⚔ SERAPHYX SHOP ⚔\n\n";

    for (let i = 0; i < skins.length; i++) {
        text += i + ". " + skins[i] + " - " + prices[i];

        if (ownedSkins[i]) text += " (Owned)\n";
        else text += " (Locked)\n";
    }

    let choice = prompt(text + "\nEnter skin number:");

    buy(parseInt(choice));
}

function buy(i) {
    if (isNaN(i)) return;
    if (i < 0 || i >= skins.length) return;

    if (ownedSkins[i]) {
        skinIndex = i;
        return;
    }

    if (coins >= prices[i]) {
        coins -= prices[i];
        ownedSkins[i] = true;
        skinIndex = i;

        coinEl.textContent = coins;
        save();

        alert("Skin unlocked!");
    } else {
        alert("Not enough coins!");
    }
}
