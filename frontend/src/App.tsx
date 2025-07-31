import { Card, CardContent } from "./components/ui/card"
import ReactMarkdown from "react-markdown"
import { ScrollArea } from "./components/ui/scroll-area"
import { Textarea } from "./components/ui/textarea"
import { Button } from "./components/ui/button"
import { Send } from "lucide-react"
import React, { useState } from "react"
import { Input } from "./components/ui/input"
import { LoremIpsum } from "lorem-ipsum"

const lorem = new LoremIpsum
const dummyText = lorem.generateParagraphs(4)

function App() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState(dummyText)
  const [password, setPassword] = useState("")
  const [hasPassword, setHasPassword] = useState(false)

  const handleClick = async () => {
    setQuery("")
    if (!query.trim()) {
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-api-key": password
        },
        body: JSON.stringify({ query })
      })
  
      if (res.status === 401) {
        setResponse("Incorrect password, reload to try again")
        return
      }

      if (res.status === 429) {
        setResponse("Rate limit exceeded, try again in a minute")
        return
      }
  
      const data = await res.json()
      setResponse(data.response)
    } catch (err) {
      console.error("API error", err)
      setResponse("Something went wrong, please try again") 
    }
  }

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleClick()
    }
  }

  const handlePasswordKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setHasPassword(true)
    }
  }

  if (!hasPassword) {
    return (
      <div className="flex items-center h-screen w-1/3 mx-auto">
        <Input
          placeholder="Enter the password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handlePasswordKeydown}
        ></Input>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="px-3 py-2">
        <p className="text-muted-foreground italic md:text-sm">
          This is the 6th time, and I have CI/CD running successfully
        </p>
      </div>
      <div className="flex flex-col mx-auto w-1/3 justify-center h-full gap-10">
        <Card className="px-6 py-0">
          <CardContent className="relative whitespace-pre-wrap px-1">
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white dark:from-background to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white dark:from-background to-transparent z-10" />

            <ScrollArea className="max-h-64 overflow-y-auto py-3">
                <ReactMarkdown>
                    {response}
                </ReactMarkdown>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="flex items-center gap-3 px-3 py-2 border shadow-sm rounded-md">
          <Textarea 
            className="resize-none border-0 shadow-none focus-visible:border-0 focus-visible:ring-0 px-0 py-0"
            placeholder="What are you writing this time"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleQueryKeyDown}
          />
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={handleClick}>
            <Send/>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
