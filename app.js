const leaderboard =
  document.getElementById("leaderboard");

const winnerSelect =
  document.getElementById("winner");

const loserSelect =
  document.getElementById("loser");

const historyDiv =
  document.getElementById("history");

const tournamentList =
  document.getElementById("tournamentList");

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

function render(){

  leaderboard.innerHTML = "";

  winnerSelect.innerHTML = "";
  loserSelect.innerHTML = "";

  players.sort(
    (a,b)=>b.points-a.points
  );

  players.forEach((player,index)=>{

    leaderboard.innerHTML += `

      <tr>

        <td>#${index+1}</td>

        <td>

          <div class="player">

            <img src="${player.avatar}">

            ${player.name}

          </div>

        </td>

        <td>${player.points}</td>

        <td>${player.wins}</td>

        <td>${player.losses}</td>

        <td>${player.streak}</td>

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
      <option>${player.name}</option>
    `;

    loserSelect.innerHTML += `
      <option>${player.name}</option>
    `;
  });

  historyDiv.innerHTML = "";

  history
    .slice()
    .reverse()
    .forEach(match=>{

      historyDiv.innerHTML += `

        <div class="history-item">

          🏓 ${match.winner}
          defeated
          ${match.loser}

          <br>

          ${match.date}

        </div>

      `;
    });

  tournamentList.innerHTML = "";

  tournaments
    .slice()
    .reverse()
    .forEach(t=>{

      tournamentList.innerHTML += `

        <div class="tournament-item">

          🏆 ${t.name}

          <br>

          Champion:
          ${t.champion}

        </div>

      `;
    });

  saveData();
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
      K*(1-ew)
    );

  loser.points =
    Math.round(
      loser.points -
      K*el
    );
}

document
  .getElementById("addPlayer")
  .addEventListener(
    "click",
    ()=>{

      const name =
        document
        .getElementById("newPlayer")
        .value
        .trim();

      const file =
        document
        .getElementById("playerPhoto")
        .files[0];

      if(!name){

        alert(
          "Enter player name."
        );

        return;
      }

      function createPlayer(image){

        players.unshift({

          name:name,

          points:100,

          wins:0,

          losses:0,

          streak:0,

          avatar:image

        });

        saveData();
        render();
      }

      if(file){

        const reader =
          new FileReader();

        reader.onload =
          function(e){

            createPlayer(
              e.target.result
            );
          };

        reader.readAsDataURL(file);

      }else{

        createPlayer(
          "https://i.imgur.com/6VBx3io.png"
        );
      }
    }
  );

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

        date:new Date()
          .toLocaleString()

      });

      saveData();
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
        .getElementById("tournamentName")
        .value;

      const champion =
        document
        .getElementById("tournamentChampion")
        .value;

      tournaments.push({

        name:name,

        champion:champion

      });

      saveData();
      render();
    }
  );

function removePlayer(name){

  players =
    players.filter(
      p=>p.name!==name
    );

  saveData();
  render();
}

function editPlayer(name){

  const player =
    players.find(
      p=>p.name===name
    );

  const newName =
    prompt(
      "New Name:",
      player.name
    );

  if(newName){

    player.name = newName;

    saveData();
    render();
  }
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
