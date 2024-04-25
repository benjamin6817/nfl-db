import { useState, useEffect } from 'react';
import { getPlayersOnTeam } from '../common/api';

export default function Players() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await getPlayersOnTeam({ teamId: 18 });
      setPlayers(response.data);
    }
    fetchData();
  }, []);

  return (
    <div className="player-list">
      {players.map(player => (
        <div className="player-card">
          <p className="player-name">{player.PlayerName}</p>
          <p className="player-position">Position: {player.Position}</p>
        </div>
      ))}
    </div>
  );
}
