import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinGroup() {
  const [groupCode, setGroupCode] = useState("");
  const[username,setUsername] = useState("");
  const navigate = useNavigate();

  async function joinGroup() {
    if (username.trim() === "") {
     alert("Please enter your name.");
     return;
    }
    
    if (groupCode.trim() === "") {
      alert("Please enter a group code.");
      return;
    }

    if (groupCode.length !== 6) {
      alert("Group code must be 6 characters.");
      return;
    }

    console.log("Sending:", {groupCode: groupCode, username: username});

    const response = await fetch("http://localhost:5000/api/groups/join", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          groupCode: groupCode,
          username : username
      })
    });

    const data = await response.json();
    console.log("Response from backend:", data);

    if (data.success) {
      navigate("/lobby", {
        state: {
          groupName: data.group.groupName,
          groupCode: data.group.code,
          currentUser: username,
          members: data.group.members
        }
      });
    }
    else {
      alert(data.message);
    }
}

  return (
    <div>
      <h1>Join Group</h1>

      <input type="text" placeholder="Enter Your Name" value={username} onChange={(e)=>setUsername(e.target.value)}/>

      <input
        type="text"
        placeholder="Enter Group Code"
        value={groupCode}
        onChange= {(e) => { setGroupCode(e.target.value); }}
      />

      <br />
      <br />

      <button onClick={joinGroup}>Join Group</button>
    </div>
  );
}

export default JoinGroup;