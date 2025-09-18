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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const prisma = new PrismaClient()

    try {
        const body = await req.json()
        const { content, status } = body

        // Validate input
        if (!content && !status) {
            return new Response("At least one field (content or status) must be provided", { status: 400 })
        }

        // Check if complaint exists
        const existingComplaint = await prisma.complaint.findUnique({
            where: { id: params.id }
        })

        if (!existingComplaint) {
            return new Response("Complaint not found", { status: 404 })
        }

        // Update the complaint
        const updatedComplaint = await prisma.complaint.update({
            where: { id: params.id },
            data: {
                ...(content && { content }),
                ...(status && { status })
            }
        })

        return new Response(JSON.stringify(updatedComplaint), {
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const prisma = new PrismaClient()

    try {
        // Check if complaint exists
        const existingComplaint = await prisma.complaint.findUnique({
            where: { id: params.id }
        })

        if (!existingComplaint) {
            return new Response("Complaint not found", { status: 404 })
        }

        // Soft delete by updating status
        const deletedComplaint = await prisma.complaint.update({
            where: { id: params.id },
            data: { status: "deleted" }
        })

        return new Response(JSON.stringify(deletedComplaint), {
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
