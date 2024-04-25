import { useEffect } from 'react';

export default function Players() {
  useEffect(() => {
    async function fetchData() {
      const response = await getPlayersOnTeam({ teamId: 18 });
      console.log(response);
    }
    fetchData();
  });

  return <p>Players</p>;
}
