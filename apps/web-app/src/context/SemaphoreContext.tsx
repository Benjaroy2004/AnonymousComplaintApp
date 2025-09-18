"use client"

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { SemaphoreEthers } from "@semaphore-protocol/data"
import { decodeBytes32String, toBeHex } from "ethers"

export type DbComplaint = {
    id: string
    content: string
    status: string
    createdAt: string
    updatedAt: string
}

export type SemaphoreContextType = {
    _users: string[]
    _complaints: string[]
    _dbComplaints: DbComplaint[]
    refreshUsers: () => Promise<void>
    addUser: (user: string) => void
    refreshComplaints: () => Promise<void>
    addComplaint: (complaint: string) => void
    refreshDbComplaints: () => Promise<void>
    addDbComplaint: (complaint: DbComplaint) => void
}

const SemaphoreContext = createContext<SemaphoreContextType | null>(null)

interface ProviderProps {
    children: ReactNode
}

const ethereumNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_NETWORK === "localhost"
        ? "http://127.0.0.1:8545"
        : process.env.NEXT_PUBLIC_DEFAULT_NETWORK

export const SemaphoreContextProvider: React.FC<ProviderProps> = ({ children }) => {
    const [_users, setUsers] = useState<any[]>([])
    const [_complaints, setComplaints] = useState<string[]>([])
    const [_dbComplaints, setDbComplaints] = useState<DbComplaint[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS,
            projectId: process.env.NEXT_PUBLIC_INFURA_API_KEY
        })

        const members = await semaphore.getGroupMembers(process.env.NEXT_PUBLIC_GROUP_ID as string)

        setUsers(members.map((member) => member.toString()))
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshComplaints = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS,
            projectId: process.env.NEXT_PUBLIC_INFURA_API_KEY
        })

        const proofs = await semaphore.getGroupValidatedProofs(process.env.NEXT_PUBLIC_GROUP_ID as string)

        setComplaints(proofs.map(({ message }: any) => decodeBytes32String(toBeHex(message, 32))))
    }, [])

    const addComplaint = useCallback(
        (complaint: string) => {
            setComplaints([..._complaints, complaint])
        },
        [_complaints]
    )

    const refreshDbComplaints = useCallback(async (): Promise<void> => {
        try {
            const response = await fetch("/api/complaint")
            if (response.ok) {
                const complaints: DbComplaint[] = await response.json()
                setDbComplaints(complaints)
            }
        } catch (error) {
            console.error("Failed to fetch DB complaints:", error)
        }
    }, [])

    const addDbComplaint = useCallback(
        (complaint: DbComplaint) => {
            setDbComplaints([complaint, ..._dbComplaints])
        },
        [_dbComplaints]
    )

    useEffect(() => {
        refreshUsers()
        refreshComplaints()
        refreshDbComplaints()
    }, [refreshComplaints, refreshUsers, refreshDbComplaints])

    return (
        <SemaphoreContext.Provider
            value={{
                _users,
                _complaints,
                _dbComplaints,
                refreshUsers,
                addUser,
                refreshComplaints,
                addComplaint,
                refreshDbComplaints,
                addDbComplaint
            }}
        >
            {children}
        </SemaphoreContext.Provider>
    )
}

export const useSemaphoreContext = () => {
    const context = useContext(SemaphoreContext)
    if (context === null) {
        throw new Error("SemaphoreContext must be used within a SemaphoreContextProvider")
    }
    return context
}
