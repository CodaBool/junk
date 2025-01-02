export async function GET() {
  const res = await fetch('https://itch.io/api/1/vVpWPNE1znZzkLAVZD0QZIB9RQqG1yGil5qAw1NU/game/2331647/download_keys', {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
 
  return Response.json({ data })
}
