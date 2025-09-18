import { task, types } from "hardhat/config"

task("deploy", "Deploy a Complaint contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = await semaphore.getAddress()
        }

        const ComplaintFactory = await ethers.getContractFactory("Complaint")

        const complaintContract = await ComplaintFactory.deploy(semaphoreAddress)

        if (logs) {
            console.info(`Complaint contract has been deployed to: ${await complaintContract.getAddress()}`)
        }

        const groupId = await complaintContract.getGroupId()

        if (logs) {
            console.info(`Group ID: ${groupId}`)
        }

        return { complaintContract, groupId }
    })
