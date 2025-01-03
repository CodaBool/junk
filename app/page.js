'use client'
import { useEffect } from 'react'
import '../styles/global.css'

export default async function Home() {


  useEffect(() => {
    const {hash} = window.location
    if (hash) {


      console.log("raw hash", hash.slice(1))

      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get("access_token");

      console.log("accessToken", accessToken)

      fetch(`/api?access_token=${accessToken}`)
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
