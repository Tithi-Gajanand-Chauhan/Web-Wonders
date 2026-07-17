import { useEffect,useState } from "react";

function TestBackend() {

    const [message,setMessage] = useState("");

    useEffect(() => {async function getData() {
            const response = await fetch("http://localhost:5000/api/test");
            const data = await response.json();
            setMessage(data.message);
    }getData();}, []);

    async function createGroup() {
        console.log("Button clicked!")
        const response = await fetch("http://localhost:5000/api/groups/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                groupName: "Movie Night",
                members: 4
            })});
        const data = await response.json();
        console.log(data);
}

    return (
        <div>
            <h1>Testing Backend</h1>
            <p>{message}</p>

            <button onClick={createGroup}>Create Test Group</button>
        </div>
    );
}
export default TestBackend