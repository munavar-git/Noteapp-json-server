import axios from "axios"
import { useEffect, useState } from "react"

function Note() {
    const [notes, setNotes] = useState([])
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    async function getNotes() {
        try {

            let response = await axios.get("http://localhost:3000/notes")
            setNotes(response.data)
            console.log(response.data)
        } catch (error) {
            console.error("an error occured while fetching notes", error)
        }
    }

    useEffect(() => {
        getNotes()
    }, [])
    async function handleSubmit(e) {
        e.preventDefault()

        const newNotes = {
            title: title.trim(),
            content: content.trim()
        }
        await axios.post("http://localhost:3000/notes", newNotes)
    }
    return (
        <>
            <h1>Notes taking app</h1>
            <form onSubmit={handleSubmit}>

                <input type="text" placeholder="enter the title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} />
                <input type="text" placeholder="enter the content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)} />
                <button type="submit">add Note</button>
            </form>
            <div >
                {notes.map((note) => (
                    <div key={note.id}>
                        <hr />
                        <h2>{note.title}</h2>
                        <p>{note.content}</p>
                        <hr />
                    </div>
                ))}
            </div>
        </>
    )
}

export default Note