class EventcasterService {
    private readonly baseUrl = 'https://events.xyz/api'
    private static instance: EventcasterService

    private constructor() {}

    static getInstance(): EventcasterService {
        if (!EventcasterService.instance) {
            EventcasterService.instance = new EventcasterService()
        }
        return EventcasterService.instance
    }

    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }

        const response = await fetch(`${this.baseUrl}/${url}`, { headers, ...options })

        if (!response.ok) {
            console.error(await response.text())
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    async getEvents() {
        return this.fetcher<{ data: Array<any> }>('events')
    }

    async getEventById(id: string) {
        return this.fetcher<{ data: any }>(`events/${id}`)
    }
}

export const eventcaster = EventcasterService.getInstance()