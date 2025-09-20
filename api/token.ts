import type { VercelRequest, VercelResponse } from "@vercel/node"
import { AccessToken } from "livekit-server-sdk"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "content-type")
  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    const { room, identity } = body || {}
    if (!room || !identity) return res.status(400).json({ error: "room and identity required" })

    const at = new AccessToken({
      apiKey: process.env.LIVEKIT_API_KEY!,
      apiSecret: process.env.LIVEKIT_API_SECRET!,
      identity,
      ttl: 60 * 60
    })
    at.addGrant({ roomJoin: true, room, canPublish: true, canPublishData: true })

    const token = await at.toJwt()
    return res.status(200).json({ token })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "internal" })
  }
}
