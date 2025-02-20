class NounsBuilderService {
    private readonly baseUrl = 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-ethereum-mainnet/stable/gn'
    private static instance: NounsBuilderService

    private constructor() {}

    static getInstance(): NounsBuilderService {
        if (!NounsBuilderService.instance) {
            NounsBuilderService.instance = new NounsBuilderService()
        }
        return NounsBuilderService.instance
    }

    private async fetcher<T>(query: string, variables: Record<string, any>): Promise<T> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables,
                operationName: "proposals",
            }),
        })

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`)
        }

        return response.json()
    }

    async getProposals({
        contractAddress,
        first = 100,
        skip = 0,
    }: {
        contractAddress: string
        first?: number
        skip?: number
    }) {
        if (!contractAddress) {
            throw new Error("Contract address is required")
        }

        const query = `
            query proposals($where: Proposal_filter, $first: Int!, $skip: Int) {
                proposals(
                    where: $where
                    first: $first
                    skip: $skip
                    orderBy: timeCreated
                    orderDirection: desc
                ) {
                    ...Proposal
                    votes {
                        ...ProposalVote
                    }
                }
            }
            fragment Proposal on Proposal {
                abstainVotes
                againstVotes
                calldatas
                description
                descriptionHash
                executableFrom
                expiresAt
                forVotes
                proposalId
                proposalNumber
                proposalThreshold
                proposer
                quorumVotes
                targets
                timeCreated
                title
                values
                voteEnd
                voteStart
                snapshotBlockNumber
                transactionHash
                dao {
                    governorAddress
                    tokenAddress
                }
            }
            fragment ProposalVote on ProposalVote {
                voter
                support
                weight
                reason
            }
        `

        return this.fetcher<{ data: { proposals: Array<any> } }>(query, {
            where: { dao: contractAddress },
            first,
            skip,
        })
    }
}

export const nounsBuilder = NounsBuilderService.getInstance()