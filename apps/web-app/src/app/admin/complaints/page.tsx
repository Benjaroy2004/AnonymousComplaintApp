"use client"

import { useEffect, useState } from "react"
import { useSemaphoreContext, DbComplaint } from "../../../context/SemaphoreContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useRouter } from "next/navigation"

export default function AdminComplaintsPage() {
    const router = useRouter()
    const { _dbComplaints, refreshDbComplaints } = useSemaphoreContext()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")
    const [editStatus, setEditStatus] = useState("")
    const [authToken, setAuthToken] = useState("")
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Simple auth check - in production, use proper authentication
    const ADMIN_TOKEN = "admin123" // Change this to a secure token

    useEffect(() => {
        // Check if already authenticated
        const storedAuth = localStorage.getItem("adminAuth")
        if (storedAuth === ADMIN_TOKEN) {
            setIsAuthenticated(true)
            refreshDbComplaints()
        }
    }, [refreshDbComplaints])

    const handleAuth = () => {
        if (authToken === ADMIN_TOKEN) {
            setIsAuthenticated(true)
            localStorage.setItem("adminAuth", ADMIN_TOKEN)
            refreshDbComplaints()
        } else {
            setError("Invalid authentication token")
        }
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem("adminAuth")
        setAuthToken("")
    }

    const handleEdit = (complaint: DbComplaint) => {
        setEditingId(complaint.id)
        setEditContent(complaint.content)
        setEditStatus(complaint.status)
    }

    const handleSave = async () => {
        if (!editingId) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/complaint/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: editContent,
                    status: editStatus
                })
            })

            if (response.ok) {
                await refreshDbComplaints()
                setEditingId(null)
                setEditContent("")
                setEditStatus("")
            } else {
                const errorData = await response.json()
                setError(errorData.message || "Failed to update complaint")
            }
        } catch (err) {
            setError("Failed to update complaint")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this complaint?")) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/complaint/${id}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await refreshDbComplaints()
            } else {
                const errorData = await response.json()
                setError(errorData.message || "Failed to delete complaint")
            }
        } catch (err) {
            setError("Failed to delete complaint")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditContent("")
        setEditStatus("")
    }

    if (!isAuthenticated) {
        return (
            <div className="container">
                <Card className="w-full max-w-md mx-auto my-auto">
                    <CardHeader>
                        <CardTitle className="text-center">Admin Access</CardTitle>
                        <CardDescription>
                            Enter the admin token to access the complaints management panel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="token">Admin Token</Label>
                                <Input
                                    id="token"
                                    type="password"
                                    value={authToken}
                                    onChange={(e) => setAuthToken(e.target.value)}
                                    placeholder="Enter admin token"
                                />
                            </div>
                            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAuth} className="w-full">
                            Authenticate
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container">
            <Card className="w-full max-w-6xl mx-auto my-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Admin - Complaints Management</CardTitle>
                            <CardDescription>
                                Manage complaints: edit content, update status, or delete entries.
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        {error && (
                            <div className="text-red-500 text-center p-4 border border-red-200 rounded">{error}</div>
                        )}

                        {_dbComplaints.length > 0 ? (
                            <div className="space-y-4">
                                {_dbComplaints.map((complaint) => (
                                    <Card key={complaint.id} className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                {editingId === complaint.id ? (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label htmlFor="content">Content</Label>
                                                            <textarea
                                                                id="content"
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="w-full p-2 border rounded-md resize-vertical min-h-[100px]"
                                                                placeholder="Complaint content"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="status">Status</Label>
                                                            <select
                                                                id="status"
                                                                value={editStatus}
                                                                onChange={(e) => setEditStatus(e.target.value)}
                                                                className="w-full p-2 border rounded-md"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="resolved">Resolved</option>
                                                                <option value="deleted">Deleted</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button onClick={handleSave} disabled={loading}>
                                                                {loading ? "Saving..." : "Save"}
                                                            </Button>
                                                            <Button variant="outline" onClick={handleCancel}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-sm text-gray-500">
                                                                ID: {complaint.id}
                                                            </span>
                                                            <span
                                                                className={`text-sm font-medium px-2 py-1 rounded ${
                                                                    complaint.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : complaint.status === "resolved"
                                                                          ? "bg-green-100 text-green-800"
                                                                          : complaint.status === "deleted"
                                                                            ? "bg-red-100 text-red-800"
                                                                            : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {complaint.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 whitespace-pre-wrap">
                                                            {complaint.content}
                                                        </p>
                                                        <div className="text-sm text-gray-500 mt-2">
                                                            Created: {new Date(complaint.createdAt).toLocaleString()}
                                                            {complaint.updatedAt !== complaint.createdAt && (
                                                                <span>
                                                                    {" "}
                                                                    | Updated:{" "}
                                                                    {new Date(complaint.updatedAt).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {editingId !== complaint.id && (
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(complaint)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(complaint.id)}
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-500">No complaints found in the database.</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => router.push("/complaints")}>
                        Back to Public View
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
