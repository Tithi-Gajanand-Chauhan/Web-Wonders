import { useState } from "react";

function JoinGroup() {
  const [groupCode, setGroupCode] = useState("");
  const [joined, setJoined] = useState(false);

  function joinGroup() {
    if (groupCode.trim() === "") {
      alert("Please enter a group code.");
      return;
    }

    if (groupCode.length !== 6) {
      alert("Group code must be 6 characters.");
      return;
    }

    setJoined(true);
}

  return (
    <div>
      <h1>Join Group</h1>

      <input
        type="text"
        placeholder="Enter Group Code"
        value={groupCode}
        onChange={(e) => setGroupCode(e.target.value)}
      />

      <br />
      <br />

      <button onClick={joinGroup}>Join Group</button>
      {joined && (
        <div>
          <h2>Joined Successfully!</h2>
          <p>Group Code: {groupCode}</p>
        </div>
      )}
    </div>
  );
}

export default JoinGroup;