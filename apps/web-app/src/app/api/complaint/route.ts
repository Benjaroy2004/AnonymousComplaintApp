import { Contract, InfuraProvider, JsonRpcProvider, Wallet, decodeBytes32String } from "ethers"
import { NextRequest } from "next/server"
import Complaint from "../../../../contract-artifacts/Complaint.json"
import { PrismaClient } from "../../../generated/prisma"

export async function POST(req: NextRequest) {
    if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
        throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
    }

    const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
    const ethereumNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK as string
    const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY as string
    const contractAddress = process.env.NEXT_PUBLIC_COMPLAINT_CONTRACT_ADDRESS as string

    const provider =
        ethereumNetwork === "localhost"
            ? new JsonRpcProvider("http://127.0.0.1:8545")
            : new InfuraProvider(ethereumNetwork, infuraApiKey)

    const signer = new Wallet(ethereumPrivateKey, provider)
    const contract = new Contract(contractAddress, Complaint.abi, signer)

    const { complaint, merkleTreeDepth, merkleTreeRoot, nullifier, externalNullifier, points } = await req.json()

    const prisma = new PrismaClient()

    try {
        const transaction = await contract.sendComplaint(
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            complaint,
            externalNullifier,
            points
        )

        await transaction.wait()

        // Decode the complaint content from bytes32 to string
        const decodedContent = decodeBytes32String(complaint)

        // Store in database
        await prisma.complaint.create({
            data: {
                content: decodedContent
            }
        })

        return new Response("Success", { status: 200 })
    } catch (error: any) {
        console.error(error)

        return new Response(`Server error: ${error}`, {
            status: 500
        })
    } finally {
        await prisma.$disconnect()
    }
}

export async function GET() {
    const prisma = new PrismaClient()

    try {
        const complaints = await prisma.complaint.findMany({
            orderBy: { createdAt: "desc" }
        })

        return new Response(JSON.stringify(complaints), {
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
