import { useState } from "react";

function GroupLobby() {
  const [members, setMembers] = useState([
    "Tithi",
    "Gayathri",
  ]);

  const [ready, setReady] = useState(false);

  function handleReady() {
    setReady(true);
  }

  return (
    <div>
      <h1>Group Lobby</h1>

      <h2>Movie Night</h2>

      <p>Group Code: A8K2ZP</p>

      <h3>Members</h3>

      {members.map((member, index) => (
        <p key={index}>👤 {member}</p>
      ))}

      <br />

      <button onClick={handleReady}>I'm Ready</button>
      {ready && <p>✅ You are ready!</p>}
    </div>
  );
}

export default GroupLobby;