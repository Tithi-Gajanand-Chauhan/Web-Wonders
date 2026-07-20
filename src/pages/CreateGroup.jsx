import { useState } from "react";
import { useNavigate } from "react-router-dom";

  function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    const [username, setUsername] = useState("");
    const [groupCode,setGroupCode] = useState("");
    const navigate = useNavigate();
  
  async function createGroup() {
    if(username.trim() === "") {
      alert("Please enter your name.");
      return;
    }  
    
    if(groupName.trim() === "") {
        alert("Please enter a group name.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          groupName: groupName,
          creatorName: username
        })});

      const data = await response.json();
      setGroupCode(data.code);
      navigate("/lobby", {
        state: {
          groupName: groupName,
          groupCode: data.code,
          currentUser: username,
          members : [username]
        }
      });
  }

  function copyCode() {
    navigator.clipboard.writeText(groupCode);
    alert("Group Code Copied!");
  }

  return (
    <div>
      <h1>Create Group</h1>

      <input
        type="text"
        placeholder="Enter Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter Group Name"
        value={groupName}
        onChange={(e) => {
          setGroupName(e.target.value); 
          setGroupCode("");}}
          />

      <br />
      <br />

      <button onClick={createGroup} disabled={groupCode!==""}>Create Group</button>
    
      {groupCode && (
        <div>
        <h2>Group Created!</h2>
        <p>Group Name: {groupName}</p>
        <p>Group Code: {groupCode}</p>
        <button onClick={copyCode}>Copy Code</button>
      </div>
      )}
    
    
    </div>
  );
}

export default CreateGroup;