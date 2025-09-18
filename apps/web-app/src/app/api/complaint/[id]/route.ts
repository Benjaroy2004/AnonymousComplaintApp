import { NextRequest } from "next/server"
import { PrismaClient } from "../../../../generated/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const prisma = new PrismaClient()

    try {
        const complaint = await prisma.complaint.findUnique({
            where: { id: params.id }
        })

        if (!complaint) {
            return new Response("Complaint not found", { status: 404 })
        }

        return new Response(JSON.stringify(complaint), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })
    } catch (error: any) {
        console.error(error)

        return new Response(`Server error: ${error}`, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
