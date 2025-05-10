export interface NounsBuilderResponse {
    data: {
        proposals: NounsBuilderProposal[];
    };
}  

export interface NounsBuilderProposal {
    abstainVotes: number;
    againstVotes: number;
    calldatas: string[];
    description: string;
    descriptionHash: string;
    executableFrom: string;
    expiresAt: string;
    forVotes: number;
    proposalId: string;
    proposalNumber: number;
    proposalThreshold: number;
    proposer: string;
    quorumVotes: number;
    targets: string[];
    timeCreated: string;
    title: string;
    values: string[];
    voteEnd: string;
    voteStart: string;
    snapshotBlockNumber: number;
    transactionHash: string;
    dao: {
      governorAddress: string;
      tokenAddress: string;
    };
}