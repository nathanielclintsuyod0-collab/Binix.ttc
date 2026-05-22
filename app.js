
/* =========================
   STATE
========================= */

let score = 0;
let coins = 0;
let time = 30;
let timer;
let running = false;

/* =========================
   ELEMENTS
========================= */

const gameArea = document.getElementById("gameArea");

/* =========================
   UI HELPERS
========================= */

const UI = {
    score(v) { document.getElementById("score").textContent = v; },
    coins(v) { document.getElementById("coins").textContent = v; },
    time(v) { document.getElementById("time").textContent = v; }
};

/* =========================
   AUDIO (NO FILES NEEDED)
========================= */

const AudioFX = {
    click() {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();

        o.connect(g);
        g.connect(ctx.destination);

        o.frequency.value = 600;
        o.start();

        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    }
};

/* =========================
   SAVE SYSTEM
========================= */

const Save = {
    load() {
        return JSON.parse(localStorage.getItem("seraphyx")) || {
            coins: 0,
            skins: [true, false, false, false],
            selected: 0
        };
    },

    write(data) {
        localStorage.setItem("seraphyx", JSON.stringify(data));
    }
};

let data = Save.load();

/* =========================
   SKINS
========================= */

const skins = ["red", "blue", "green", "gold"];

/* =========================
   GAME ENGINE
========================= */

const Game = {

    start() {
        score = 0;
        time = 30;
        running = true;

        document.getElementById("menu").classList.add("hidden");
        document.getElementById("hud").classList.remove("hidden");
        gameArea.classList.remove("hidden");

        UI.score(score);
        UI.coins(data.coins);
        UI.time(time);

        this.spawn();

        timer = setInterval(() => {
            time--;
            UI.time(time);

            if (time <= 0) this.end();
        }, 1000);
    },

    spawn() {
        const t = document.createElement("div");
        t.className = "target";
        t.style.background = skins[data.selected];

        t.style.left = Math.random() * 80 + "%";
        t.style.top = Math.random() * 80 + "%";

        t.onclick = () => {
            if (!running) return;

            score++;
            data.coins++;

            UI.score(score);
            UI.coins(data.coins);

            AudioFX.click();

            Save.write(data);

            t.remove();
            this.spawn();
        };

        gameArea.appendChild(t);
    },

    end() {
        running = false;
        clearInterval(timer);
        gameArea.innerHTML = "";

        alert("⚔ Game Over | Score: " + score);
    }
};

/* =========================
   SHOP SYSTEM
========================= */

const Shop = {

    open() {
        document.getElementById("shop").classList.remove("hidden");

        const box = document.getElementById("shopItems");
        box.innerHTML = "";

        skins.forEach((s, i) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>${s.toUpperCase()}</p>
                <button onclick="Shop.select(${i})">Select</button>
            `;

            box.appendChild(div);
        });
    },

    close() {
        document.getElementById("shop").classList.add("hidden");
    },

    select(i) {
        data.selected = i;
        Save.write(data);
        alert("Skin selected: " + skins[i]);
    }
};
