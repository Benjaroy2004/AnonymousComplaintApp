import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import { expect } from "chai"
import { encodeBytes32String } from "ethers"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
// eslint-disable-next-line
import { Complaint, ISemaphore } from "../typechain-types"

describe("Complaint", () => {
    async function deployComplaintFixture() {
        const { semaphore } = await run("deploy:semaphore", {
            logs: false
        })

        const semaphoreContract: ISemaphore = semaphore

        const complaintContract: Complaint = await run("deploy", {
            logs: false,
            semaphore: await semaphoreContract.getAddress()
        })

        const groupId = await complaintContract.groupId()

        return { semaphoreContract, complaintContract, groupId }
    }

    describe("# joinGroup", () => {
        it("Should allow users to join the group", async () => {
            const { semaphoreContract, complaintContract, groupId } = await loadFixture(deployComplaintFixture)

            const users = [new Identity(), new Identity()]

            const group = new Group()

            for (const [i, user] of users.entries()) {
                const transaction = await complaintContract.joinGroup(user.commitment)
                group.addMember(user.commitment)

                await expect(transaction)
                    .to.emit(semaphoreContract, "MemberAdded")
                    .withArgs(groupId, i, user.commitment, group.root)
            }
        })
    })

    describe("# sendComplaint", () => {
        it("Should allow users to send complaint anonymously", async () => {
            const { semaphoreContract, complaintContract, groupId } = await loadFixture(deployComplaintFixture)

            const users = [new Identity(), new Identity()]
            const group = new Group()

            for (const user of users) {
                await complaintContract.joinGroup(user.commitment)
                group.addMember(user.commitment)
            }

            const complaint = encodeBytes32String("Hello World")

            const proof = await generateProof(users[1], group, complaint, groupId)

            const transaction = complaintContract.sendComplaint(
                proof.merkleTreeDepth,
                proof.merkleTreeRoot,
                proof.nullifier,
                complaint,
                proof.points
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupId,
                    proof.merkleTreeDepth,
                    proof.merkleTreeRoot,
                    proof.nullifier,
                    proof.message,
                    groupId,
                    proof.points
                )
        })
    })
})
