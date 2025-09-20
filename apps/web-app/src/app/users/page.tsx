"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Alert,AlertDescription,AlertTitle} from "@/components/ui/alert"
import { useState } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { Identity } from "@semaphore-protocol/core"
import { useLogContext } from "@/context/LogContext"
// bcrypt
import bcrypt from "bcryptjs"


export default function UsersPage() {
    const router = useRouter()

    const [dni, setDni] = useState("");
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const {setLog} = useLogContext()
    const [_identity, setIdentity] = useState<Identity>()
    const [stateIdentity, setStateIdentity] = useState<boolean>(false)

    // Create identity
    const createIdentity = (dni: string) => async () => {
        const identity = new Identity(await bcrypt.hash(dni, 10))

        setIdentity(identity)

        setStateIdentity(true)

        console.log("Identidad",_identity)

        localStorage.setItem("identity", identity.export())
        return identity
    }
    
    const isValidEcuadorianDNI = (dni: string) => async () => {
        if (!/^\d{10}$/.test(dni)) return false;
        
        const digits = dni.split('').map(Number);
        const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          let result = digits[i] * coefficients[i];
          if (result >= 10) result = Math.floor(result / 10) + (result % 10);
          sum += result;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        const isValidCheckDigit = checkDigit === digits[9];
        
        if (isValidCheckDigit===true) {
            const createIdentityResult = await createIdentity(dni)()
            console.log("createIdentityResult",createIdentityResult)
            setIsValid(true)
            return true
        } else {
            setIsValid(false)
            return false
        }
      };


    return (
        <>
        <div className="container">
        <Card className="w-full max-w-sm mx-auto my-auto">
            <CardHeader>
                <CardTitle className="text-center"> ID number verification </CardTitle>
                <CardDescription>
                Enter your ID below to know that you are Ecuadorian.
                </CardDescription>
            </CardHeader>
            <CardContent>
            <form>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="dni">ID number</Label>
                        </div>
                        <Input 
                            id="dni" 
                            type="text" 
                            required 
                            value={dni} 
                            onChange={(e) => {
                                setDni(e.target.value);
                                setIsValid(null);
                            }} 
                        />
                    </div>
                    {isValid === false && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                Invalid Ecuadorian ID number.
                            </AlertDescription>
                        </Alert>
                    )}
                    {isValid === true && (
                        <Alert>
                        <CheckCircle2Icon className="text-green-600"/>
                        <AlertTitle>Success! Your dni is valid</AlertTitle>
                        <AlertDescription>You can continue to the next step</AlertDescription>
                      </Alert>
                    )}
                </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button 
                type="button" 
                className="button" 
                onClick={() => isValidEcuadorianDNI(dni)()}
            >
                Verify
            </Button>
            {/* Next step */}
            {stateIdentity && (
                <Button 
                    className="button" 
                    onClick={() => router.push("/group")}
                >
                    Next
                </Button>
            )}
        </CardFooter>
                    </Card>
                    
        </div>
        </>
    )
}