"use client"

import { useEffect, useState } from "react"
import { useSemaphoreContext, DbComplaint } from "../../context/SemaphoreContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { useRouter } from "next/navigation"

export default function ComplaintsPage() {
    const router = useRouter()
    const { _dbComplaints, refreshDbComplaints } = useSemaphoreContext()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        refreshDbComplaints()
    }, [refreshDbComplaints])

    const handleRefresh = async () => {
        setLoading(true)
        setError(null)
        try {
            await refreshDbComplaints()
        } catch (err) {
            setError("Failed to refresh complaints")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className="container">
            <Card className="w-full max-w-4xl mx-auto my-auto">
                <CardHeader>
                    <CardTitle className="text-center">Complaints Database</CardTitle>
                    <CardDescription>
                        View all complaints stored in the database. These are the decoded, readable versions of the
                        anonymous submissions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="text-top">
                            <h3>All Complaints ({_dbComplaints.length})</h3>
                            <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
                                <span className="refresh-span">
                                    <svg viewBox="0 0 24 24" focusable="false" className="refresh-icon">
                                        <path
                                            fill="currentColor"
                                            d="M5.463 4.43301C7.27756 2.86067 9.59899 1.99666 12 2.00001C17.523 2.00001 22 6.47701 22 12C22 14.136 21.33 16.116 20.19 17.74L17 12H20C20.0001 10.4316 19.5392 8.89781 18.6747 7.58927C17.8101 6.28072 16.5799 5.25517 15.1372 4.64013C13.6944 4.0251 12.1027 3.84771 10.56 4.13003C9.0172 4.41234 7.59145 5.14191 6.46 6.22801L5.463 4.43301ZM18.537 19.567C16.7224 21.1393 14.401 22.0034 12 22C6.477 22 2 17.523 2 12C2 9.86401 2.67 7.88401 3.81 6.26001L7 12H4C3.99987 13.5684 4.46075 15.1022 5.32534 16.4108C6.18992 17.7193 7.42007 18.7449 8.86282 19.3599C10.3056 19.9749 11.8973 20.1523 13.44 19.87C14.9828 19.5877 16.4085 18.8581 17.54 17.772L18.537 19.567Z"
                                        ></path>
                                    </svg>
                                </span>
                                {loading ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>

                        {error && (
                            <div className="text-red-500 text-center p-4 border border-red-200 rounded">{error}</div>
                        )}

                        {_dbComplaints.length > 0 ? (
                            <div className="complaint-wrapper">
                                {_dbComplaints.map((complaint) => (
                                    <div key={complaint.id} className="complaint-item">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm text-gray-500">
                                                Status:{" "}
                                                <span
                                                    className={`font-medium ${
                                                        complaint.status === "pending"
                                                            ? "text-yellow-600"
                                                            : complaint.status === "resolved"
                                                              ? "text-green-600"
                                                              : complaint.status === "deleted"
                                                                ? "text-red-600"
                                                                : "text-gray-600"
                                                    }`}
                                                >
                                                    {complaint.status}
                                                </span>
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(complaint.createdAt)}
                                            </span>
                                        </div>
                                        <p className="box box-text break-all">{complaint.content}</p>
                                        <div className="mt-2 text-xs text-gray-400">ID: {complaint.id}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-500">
                                No complaints found. Submit a complaint first to see it here.
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <div className="flex gap-4">
                        <Button onClick={() => router.push("/proofs")}>Submit New Complaint</Button>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Back to Home
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
