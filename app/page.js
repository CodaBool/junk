'use client'
import { useEffect, useState } from 'react'
import '../styles/global.css'

export default async function Home() {
  const [purchase, setPurchase] = useState()

  useEffect(() => {
    const {hash} = window.location
    if (hash) {


      console.log("raw hash", hash.slice(1))

      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get("access_token");

      console.log("accessToken", accessToken)

      fetch(`/api?access_token=${accessToken}`)
        .then((res) => res.json())
        .then((json) => {
          console.log(json)
          if (json?.data?.purchases?.length) {
            setPurchase(json.data.purchases[0])
          }
        })
    }
  }, [])


  return (
    <main>
      {purchase ? <div>
        <h1>Bought on: {purchase.created_at}</h1>
        <h1>email: {purchase.email}</h1>
        <h1>source: {purchase.source}</h1>
        <h1>status: {purchase.status}</h1>
      </div> : <h1>request sent</h1>}
    </main>
  )
}
