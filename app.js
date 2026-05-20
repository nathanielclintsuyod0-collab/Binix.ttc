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

const submitMatch =
  document.getElementById("submitMatch");

const addPlayerBtn =
  document.getElementById("addPlayer");

const newPlayerInput =
  document.getElementById("newPlayer");

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

function render(){

  players.sort(
    (a,b)=>b.points-a.points
  );

  leaderboard.innerHTML = "";

  winnerSelect.innerHTML = "";
  loserSelect.innerHTML = "";

  players.forEach((player,index)=>{

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

        <td>${player.name}</td>

        <td>${player.points}</td>

        <td>${player.wins}</td>

        <td>${player.losses}</td>

        <td>🔥 ${player.streak}</td>

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

      <strong>
        ${top.name}
      </strong>

      <br>

      ${top.points} Points

      <br>

      ${top.wins} Wins •
      ${top.losses} Losses

      <br>

      🔥 ${top.streak} Win Streak

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

          defeated

          <strong>${match.loser}</strong>

          <br><br>

          🕒 ${match.date}

        </div>

      `;
    });
}

submitMatch.addEventListener(
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

addPlayerBtn.addEventListener(
  "click",
  ()=>{

    const name =
      newPlayerInput.value.trim();

    if(!name){

      alert(
        "Please enter a player name."
      );

      return;
    }

    const exists =
      players.some(
        p=>
        p.name.toLowerCase()===
        name.toLowerCase()
      );

    if(exists){

      alert(
        "Player already exists."
      );

      return;
    }

    players.push({

      name:name,

      points:100,

      wins:0,

      losses:0,

      streak:0

    });

    newPlayerInput.value = "";

    saveData();
    render();
  }
);

render();
