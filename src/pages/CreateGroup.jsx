import { useState } from "react";

  function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    const [groupCode,setGroupCode] = useState("");
  
  function generateCode() {
      return Math.random().toString(36).substring(2,8).toUpperCase();
  }
  
  
  function createGroup() {
      if(groupName.trim() === "") {
        alert("Please enter a group name.");
        return;
      }

      if(groupCode !== "") {
        return;
      }
      const code = generateCode();
      setGroupCode(code);
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
        placeholder="Enter Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <br />
      <br />

      <button onClick={createGroup}>Create Group</button>
    
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