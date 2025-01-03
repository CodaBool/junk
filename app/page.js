'use client'
import { useEffect } from 'react'
import '../styles/global.css'

export default async function Home() {


  useEffect(() => {
    const {hash} = window.location
    if (hash) {
      console.log("sending request with token", hash.slice(1))
      fetch(`/api?access_token=${hash.slice(1)}`)
        .then((res) => res.json())
        .then((json) => console.log("result", json));
    }
  }, [])


  return (
    <main>
      <h1>
        check console
      </h1>
    </main>
  )
}
