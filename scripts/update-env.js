#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Function to update .env file
function updateEnvFile(envPath, updates) {
    if (!fs.existsSync(envPath)) {
        console.log(`Creating ${envPath}`)
        fs.writeFileSync(envPath, "")
    }

    let content = fs.readFileSync(envPath, "utf8")
    let lines = content.split("\n")

    // Update or add variables
    Object.entries(updates).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, "m")
        const newLine = `${key}=${value}`

        if (regex.test(content)) {
            lines = lines.map((line) => (regex.test(line) ? newLine : line))
        } else {
            lines.push(newLine)
        }
    })

    fs.writeFileSync(envPath, lines.join("\n"))
    console.log(`Updated ${envPath}`)
}

// Main function
function main() {
    const args = process.argv.slice(2)
    if (args.length < 3) {
        console.log("Usage: node update-env.js <semaphoreAddress> <complaintAddress> <groupId>")
        process.exit(1)
    }

    const [semaphoreAddress, complaintAddress, groupId] = args

    // Update web-app .env.development
    const webAppEnvPath = path.join(__dirname, "..", "apps", "web-app", ".env.development")
    updateEnvFile(webAppEnvPath, {
        NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS: semaphoreAddress,
        NEXT_PUBLIC_COMPLAINT_CONTRACT_ADDRESS: complaintAddress,
        NEXT_PUBLIC_GROUP_ID: groupId
    })

    console.log("Environment files updated successfully!")
}

if (require.main === module) {
    main()
}
