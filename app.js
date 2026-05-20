const leaderboard =
  document.getElementById("leaderboard");

const topPlayer =
  document.getElementById("topPlayer");

const historyDiv =
  document.getElementById("history");

const tournamentList =
  document.getElementById("tournamentList");

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

let tournaments =
  JSON.parse(
    localStorage.getItem("tournaments")
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

  localStorage.setItem(
    "tournaments",
    JSON.stringify(tournaments)
  );
}

function expected(a,b){

  return 1 / (
    1 + Math.pow(
      10,
      (b-a)/400
    )
  );
}

function updatePoints(winner,loser){

  const K = 32;

  const ew =
    expected(
      winner.points,
      loser.points
    );

  const el =
    expected(
      loser.points,
      winner.points
    );

  winner.points =
    Math.round(
      winner.points +
      K * (1-ew)
    );

  loser.points =
    Math.round(
      loser.points -
      K * el
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

    let rank = "";

    if(index===0) rank="rank1";
    if(index===1) rank="rank2";
    if(index===2) rank="rank3";

    leaderboard.innerHTML += `

      <tr>

        <td class="${rank}">
          #${index+1}
        </td>

        <td>

          <div class="player">

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

      <div class="top">

        <img
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

  tournamentList.innerHTML = "";

  tournaments
    .slice()
    .reverse()
    .forEach(tournament=>{

      tournamentList.innerHTML += `

        <div class="tournament-item">

          🏆
          <strong>
            ${tournament.name}
          </strong>

          <br><br>

          Champion:
          ${tournament.champion}

          <br><br>

          📅 ${tournament.date}

        </div>

      `;
    });

  document.getElementById(
    "totalPlayers"
  ).textContent =
    players.length;

  document.getElementById(
    "totalMatches"
  ).textContent =
    history.length;

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
    document.getElementById(
      "pointsChart"
    );

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

        winnerScore:
          document.getElementById(
            "winnerScore"
          ).value,

        loserScore:
          document.getElementById(
            "loserScore"
          ).value,

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
          "Enter avatar URL (optional)"
        );

      players.unshift({

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

document
  .getElementById("addTournament")
  .addEventListener(
    "click",
    ()=>{

      const name =
        document
        .getElementById(
          "tournamentName"
        ).value;

      const champion =
        document
        .getElementById(
          "tournamentChampion"
        ).value;

      if(!name || !champion){

        alert(
          "Fill all tournament fields."
        );

        return;
      }

      tournaments.push({

        name:name,

        champion:champion,

        date:new Date()
          .toLocaleDateString()

      });

      document.getElementById(
        "tournamentName"
      ).value = "";

      document.getElementById(
        "tournamentChampion"
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
      "New player name:",
      player.name
    );

  if(newName)
    player.name = newName;

  render();
}

function exportData(){

  const data = {

    players,
    history,
    tournaments

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

function resetAll(){

  if(
    !confirm(
      "Reset all data?"
    )
  ) return;

  players = [];
  history = [];
  tournaments = [];

  localStorage.clear();

  render();
}

render();

globalThis.removePlayer =
  removePlayer;

globalThis.editPlayer =
  editPlayer;

globalThis.exportData =
  exportData;

globalThis.resetAll =
  resetAll;
