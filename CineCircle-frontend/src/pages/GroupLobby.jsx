import { useLocation, useNavigate } from "react-router-dom";

function GroupLobby() {
  const location = useLocation();
  const navigate = useNavigate();
  const { groupName, groupCode, members, currentUser } = location.state || {};

  if (!groupName || !groupCode) {
    return <h2>No Group Data Found</h2>;
  }

  function handleReady() {
    console.log("button clicked");
    navigate("/preferences", {
        state: {
            groupName: groupName,
            groupCode: groupCode,
            currentUser: currentUser
        }
    });
}

  return (
    <div>
      <h1>Group Lobby</h1>

      <h2>{groupName}</h2>

      <p>Group Code: {groupCode}</p>

      <h3>Members</h3>

      {members.map((member, index) => (
        <p key={index}>👤 {member}</p>
      ))}

      <br />

      <button onClick={handleReady}>I'm Ready</button>
    </div>
  );
}

export default GroupLobby;