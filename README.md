# Anonymous Complaint App

## Problem Description

This application enables users to submit anonymous complaints using zero-knowledge proofs, ensuring that sensitive reports can be made without revealing the submitter's identity. It addresses the challenge of whistleblowing and reporting misconduct in organizations or communities where fear of retaliation might otherwise prevent disclosures. By leveraging blockchain technology and cryptographic anonymity, it provides a secure platform for transparent yet private communication.

## Technology Stack

- **Semaphore**: For zero-knowledge proof-based anonymity
- **Hardhat**: Ethereum development environment for smart contracts
- **Next.js**: React framework for the frontend application
- **Prisma**: Database ORM for data management
- **TypeScript**: Type-safe JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Ethereum/Sepolia**: Testnet for deploying and testing smart contracts

## Instructions for Running the Prototype

### Prerequisites

- Node.js (version 18 or higher)
- Yarn package manager
- A Sepolia testnet account with some ETH for deployment

### 1. Install Dependencies

```bash
yarn
```

### 2. Set Up Environment Variables

- Copy `.env.example` to `.env.development` and `.env.production`
- Configure your Sepolia RPC URL, private key, and other necessary variables

### 3. Deploy the Contract

1. Navigate to the contracts directory:

```bash
cd apps/contracts
```

2. Deploy the contract to Sepolia:

```bash
yarn deploy --semaphore <semaphore-address> --network sepolia
```

> [!NOTE]
> Check the Semaphore contract addresses [here](https://docs.semaphore.pse.dev/deployed-contracts).

3. Update `apps/web-app/.env.production` with the new contract address and group ID.

4. Copy contract artifacts:

```bash
cp artifacts/contracts/Complaint.sol/Complaint.json ../web-app/contract-artifacts/
```

### 4. Run the Application

Start the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

### 5. Access Features

- **Complaints Page**: Submit anonymous complaints
- **Admin Page**: View and manage complaints (requires admin access)
- **Group Management**: Join or create complaint groups
- **Proofs**: Verify complaint authenticity

### Code Quality

Run linting and formatting:

```bash
yarn lint
yarn prettier
yarn prettier:write  # To auto-format
```

## Roadmap

- **Multi-Group Support**: Allow users to participate in multiple complaint groups
- **Complaint Verification**: Implement additional verification mechanisms for submitted complaints
- **Admin Moderation Tools**: Enhanced dashboard for administrators to manage and categorize complaints
- **Integration with Other Blockchains**: Support for additional networks beyond Ethereum
- **Mobile Application**: Native mobile app for easier access
- **Advanced Analytics**: Dashboard for analyzing complaint trends and patterns
- **Notification System**: Real-time notifications for complaint updates
- **Audit Trail**: Immutable logging of complaint lifecycle for transparency
