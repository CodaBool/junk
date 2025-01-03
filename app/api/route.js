export async function GET() {
  const { searchParams } = new URL(request.url)
  const access_token = searchParams.get('access_token')

  const response = await fetch(`https://itch.io/api/1/${access_token}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const result = await response.json()
  console.log("me", result)

  const id = result.data.user.id

  const res = await fetch(`https://itch.io/api/1/${process.env.ITCH_TOKEN}/game/2331647/purchases?user_id=${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
  console.log("purchase", data)
 
  return Response.json({ data })
}
