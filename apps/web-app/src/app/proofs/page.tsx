"use client"

import Stepper from "@/components/Stepper"
import { useLogContext } from "@/context/LogContext"
import { useSemaphoreContext } from "@/context/SemaphoreContext"
import { generateProof, Group } from "@semaphore-protocol/core"
import { encodeBytes32String, ethers } from "ethers"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import Complaint from "../../../contract-artifacts/Complaint.json"
import useSemaphoreIdentity from "@/hooks/useSemaphoreIdentity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProofsPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const { _users, _complaints, refreshComplaints, addComplaint } = useSemaphoreContext()
    const [_loading, setLoading] = useState(false)
    const { _identity } = useSemaphoreIdentity()

    useEffect(() => {
        if (_complaints.length > 0) {
            setLog(`${_complaints.length} complaints retrieved from the group 🤙🏽`)
        }
    }, [_complaints, setLog])

    const complaints = useMemo(() => [..._complaints].reverse(), [_complaints])

    const sendComplaint = useCallback(async () => {
        if (!_identity) {
            return
        }

        const complaint = prompt("Please enter your complaint:")

        if (complaint && _users) {
            setLoading(true)

            setLog(`Posting your anonymous complaint...`)

            try {
                const group = new Group(_users)

                const message = encodeBytes32String(complaint)

                // Generate unique external nullifier to allow multiple complaints per identity
                const externalNullifier = ethers.keccak256(
                    ethers.toUtf8Bytes(`${process.env.NEXT_PUBLIC_GROUP_ID}-${Date.now()}-${Math.random()}`)
                )

                const { points, merkleTreeDepth, merkleTreeRoot, nullifier } = await generateProof(
                    _identity,
                    group,
                    message,
                    externalNullifier
                )

                let complaintSent: boolean = false
                const params = [merkleTreeDepth, merkleTreeRoot, nullifier, message, externalNullifier, points]
                if (process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    const response = await fetch(process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            abi: Complaint.abi,
                            address: process.env.NEXT_PUBLIC_COMPLAINT_CONTRACT_ADDRESS,
                            functionName: "sendComplaint",
                            functionParameters: params
                        })
                    })

                    if (response.status === 200) {
                        complaintSent = true
                    }
                } else if (
                    process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT &&
                    process.env.NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID &&
                    process.env.GELATO_RELAYER_API_KEY
                ) {
                    const iface = new ethers.Interface(Complaint.abi)
                    const request = {
                        chainId: process.env.NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID,
                        target: process.env.NEXT_PUBLIC_COMPLAINT_CONTRACT_ADDRESS,
                        data: iface.encodeFunctionData("sendComplaint", params),
                        sponsorApiKey: process.env.GELATO_RELAYER_API_KEY
                    }
                    const response = await fetch(process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(request)
                    })

                    if (response.status === 201) {
                        complaintSent = true
                    }
                } else {
                    const response = await fetch("api/complaint", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            complaint: message,
                            merkleTreeDepth,
                            merkleTreeRoot,
                            nullifier,
                            externalNullifier,
                            points
                        })
                    })

                    if (response.status === 200) {
                        complaintSent = true
                    }
                }

                if (complaintSent) {
                    addComplaint(complaint)

                    setLog(`Your complaint has been posted 🎉`)
                } else {
                    setLog("Some error occurred, please try again!")
                }
            } catch (error) {
                console.error(error)

                setLog("Some error occurred, please try again!")
            } finally {
                setLoading(false)
            }
        }
    }, [_identity, _users, addComplaint, setLoading, setLog])

    return (
        <>
            <div className="container">
                <Card className="w-full max-w-2xl mx-auto my-auto">
                    <CardHeader>
                        <CardTitle className="text-center">Proofs</CardTitle>
                        <CardDescription>
                            <p>
                                Semaphore members can anonymously{" "}
                                <a
                                    href="https://docs.semaphore.pse.dev/guides/proofs"
                                    target="_blank"
                                    rel="noreferrer noopener nofollow"
                                >
                                    prove
                                </a>{" "}
                                that they are part of a group and send their anonymous messages. Messages could be
                                votes, leaks, reviews, complaints, etc.
                            </p>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="text-top">
                                <h3>Complaints ({_complaints.length})</h3>
                                <button className="refresh-button" onClick={refreshComplaints}>
                                    <span className="refresh-span">
                                        <svg viewBox="0 0 24 24" focusable="false" className="refresh-icon">
                                            <path
                                                fill="currentColor"
                                                d="M5.463 4.43301C7.27756 2.86067 9.59899 1.99666 12 2.00001C17.523 2.00001 22 6.47701 22 12C22 14.136 21.33 16.116 20.19 17.74L17 12H20C20.0001 10.4316 19.5392 8.89781 18.6747 7.58927C17.8101 6.28072 16.5799 5.25517 15.1372 4.64013C13.6944 4.0251 12.1027 3.84771 10.56 4.13003C9.0172 4.41234 7.59145 5.14191 6.46 6.22801L5.463 4.43301ZM18.537 19.567C16.7224 21.1393 14.401 22.0034 12 22C6.477 22 2 17.523 2 12C2 9.86401 2.67 7.88401 3.81 6.26001L7 12H4C3.99987 13.5684 4.46075 15.1022 5.32534 16.4108C6.18992 17.7193 7.42007 18.7449 8.86282 19.3599C10.3056 19.9749 11.8973 20.1523 13.44 19.87C14.9828 19.5877 16.4085 18.8581 17.54 17.772L18.537 19.567Z"
                                            ></path>
                                        </svg>
                                    </span>
                                    Refresh
                                </button>
                            </div>

                            {complaints.length > 0 && (
                                <div className="complaint-wrapper">
                                    {complaints.map((c, i) => (
                                        <div key={i}>
                                            <p className="box box-text break-all">{c}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <div className="flex gap-2">
                            <button className="button" onClick={sendComplaint} disabled={_loading}>
                                <span>Send Complaint</span>
                                {_loading && <div className="loader"></div>}
                            </button>
                            <button
                                className="button"
                                onClick={() => router.push("/complaints")}
                            >
                                <span>View Complaints</span>
                            </button>
                        </div>
                        <div>
                            <Stepper step={3} onPrevClick={() => router.push("/group")} />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
