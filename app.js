const leaderboard =
  document.getElementById("leaderboard");

const topPlayer =
  document.getElementById("topPlayer");

const historyDiv =
  document.getElementById("history");

const winnerSelect =
  document.getElementById("winner");

const loserSelect =
  document.getElementById("loser");

let players =
  JSON.parse(
    localStorage.getItem("players")
  ) || [];

let history =
  JSON.parse(
    localStorage.getItem("history")
  ) || [];

function saveData(){

  localStorage.setItem(
    "players",
    JSON.stringify(players)
  );

  localStorage.setItem(
    "history",
    JSON.stringify(history)
  );
}

function expectedScore(a,b){

  return 1 / (
    1 + Math.pow(
      10,
      (b-a)/400
    )
  );
}

function updatePoints(winner,loser){

  const K = 32;

  const expectedWinner =
    expectedScore(
      winner.points,
      loser.points
    );

  const expectedLoser =
    expectedScore(
      loser.points,
      winner.points
    );

  winner.points = Math.round(
    winner.points +
    K * (1 - expectedWinner)
  );

  loser.points = Math.round(
    loser.points -
    K * expectedLoser
  );
}

function updateBadges(player){

  player.badges = [];

  if(player.points >= 300)
    player.badges.push("🏆 Elite");

  if(player.streak >= 5)
    player.badges.push("🔥 Streak");

  if(player.wins >= 10)
    player.badges.push("⚡ Veteran");
}

function render(){

  players.sort(
    (a,b)=>b.points-a.points
  );

  leaderboard.innerHTML = "";

  winnerSelect.innerHTML = "";
  loserSelect.innerHTML = "";

  players.forEach((player,index)=>{

    updateBadges(player);

    let rankClass = "";

    if(index===0)
      rankClass="rank1";

    if(index===1)
      rankClass="rank2";

    if(index===2)
      rankClass="rank3";

    leaderboard.innerHTML += `

      <tr>

        <td class="${rankClass}">
          #${index+1}
        </td>

        <td>

          <div class="player-cell">

            <img
              src="${
                player.avatar ||
                'https://i.imgur.com/6VBx3io.png'
              }"
            >

            ${player.name}

          </div>

        </td>

        <td>${player.points}</td>

        <td>${player.wins}</td>

        <td>${player.losses}</td>

        <td>🔥 ${player.streak}</td>

        <td>

          ${
            player.badges
            .map(
              b=>`
                <span class="badge">
                  ${b}
                </span>
              `
            )
            .join("")
          }

        </td>

        <td>

          <button
            onclick="editPlayer('${player.name}')"
          >
            Edit
          </button>

          <button
            onclick="removePlayer('${player.name}')"
          >
            Remove
          </button>

        </td>

      </tr>

    `;

    winnerSelect.innerHTML += `
      <option value="${player.name}">
        ${player.name}
      </option>
    `;

    loserSelect.innerHTML += `
      <option value="${player.name}">
        ${player.name}
      </option>
    `;
  });

  if(players.length > 0){

    const top = players[0];

    topPlayer.innerHTML = `

      <div class="top-wrapper">

        <img
          class="top-avatar"
          src="${
            top.avatar ||
            'https://i.imgur.com/6VBx3io.png'
          }"
        >

        <div>

          <h2>
            ${top.name}
          </h2>

          <p>
            ${top.points} Points
          </p>

          <p>
            ${top.wins} Wins •
            ${top.losses} Losses
          </p>

          <p>
            🔥 ${top.streak} Win Streak
          </p>

        </div>

      </div>

    `;
  }

  historyDiv.innerHTML = "";

  history
    .slice()
    .reverse()
    .forEach(match=>{

      historyDiv.innerHTML += `

        <div class="history-item">

          🏓
          <strong>${match.winner}</strong>

          (${match.winnerScore})

          defeated

          <strong>${match.loser}</strong>

          (${match.loserScore})

          <br><br>

          🕒 ${match.date}

        </div>

      `;
    });

  document.getElementById(
    "totalPlayers"
  ).textContent = players.length;

  document.getElementById(
    "totalMatches"
  ).textContent = history.length;

  document.getElementById(
    "highestPoints"
  ).textContent =
    players[0]
      ? players[0].points
      : 0;

  document.getElementById(
    "longestStreak"
  ).textContent =
    Math.max(
      0,
      ...players.map(
        p=>p.streak
      )
    );

  renderChart();

  saveData();
}

function renderChart(){

  const ctx =
    document
    .getElementById("pointsChart");

  if(window.pointsChart){

    window.pointsChart.destroy();
  }

  window.pointsChart =
    new Chart(ctx,{

      type:'bar',

      data:{

        labels:
          players.map(
            p=>p.name
          ),

        datasets:[{

          label:'Points',

          data:
            players.map(
              p=>p.points
            ),

          borderWidth:1

        }]
      }
    });
}

document
  .getElementById("submitMatch")
  .addEventListener(
    "click",
    ()=>{

      const winnerName =
        winnerSelect.value;

      const loserName =
        loserSelect.value;

      const winnerScore =
        document
        .getElementById(
          "winnerScore"
        ).value;

      const loserScore =
        document
        .getElementById(
          "loserScore"
        ).value;

      if(
        winnerName===loserName
      ){

        alert(
          "Players cannot be the same."
        );

        return;
      }

      const winner =
        players.find(
          p=>p.name===winnerName
        );

      const loser =
        players.find(
          p=>p.name===loserName
        );

      updatePoints(
        winner,
        loser
      );

      winner.wins++;
      loser.losses++;

      winner.streak++;
      loser.streak = 0;

      history.push({

        winner:winner.name,

        loser:loser.name,

        winnerScore:winnerScore,

        loserScore:loserScore,

        date:new Date()
          .toLocaleString()

      });

      render();
    }
  );

document
  .getElementById("addPlayer")
  .addEventListener(
    "click",
    ()=>{

      const name =
        document
        .getElementById(
          "newPlayer"
        ).value
        .trim();

      if(!name){

        alert(
          "Enter player name."
        );

        return;
      }

      const avatar =
        prompt(
          "Enter image URL (optional)"
        );

      players.push({

        name:name,

        points:100,

        wins:0,

        losses:0,

        streak:0,

        avatar:avatar,

        badges:[]

      });

      document
        .getElementById(
          "newPlayer"
        ).value = "";

      render();
    }
  );

function removePlayer(name){

  players =
    players.filter(
      p=>p.name!==name
    );

  render();
}

function editPlayer(oldName){

  const player =
    players.find(
      p=>p.name===oldName
    );

  const newName =
    prompt(
      "New name:",
      player.name
    );

  if(newName)
    player.name = newName;

  render();
}

function resetAll(){

  if(
    !confirm(
      "Reset everything?"
    )
  ) return;

  players = [];
  history = [];

  localStorage.clear();

  render();
}

function exportData(){

  const data = {

    players,
    history

  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "binix-backup.json";

  a.click();
}

render();

window.removePlayer =
  removePlayer;

window.editPlayer =
  editPlayer;

window.resetAll =
  resetAll;

window.exportData =
  exportData;
