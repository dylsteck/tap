
export async function GET() {
    const config = {
        "accountAssociation": {
            "header": "eyJmaWQiOjYxNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDVFNzlGNjkwY2NENDIwMDdENUEwYUQ2NzhDRDQ3NDc0MzM5NDAwRTMifQ",
            "payload": "eyJkb21haW4iOiJ0YXAuY29tcHV0ZXIifQ",
            "signature": "MHhiNDMxMzBmNTI5MjFjYTYwMWI0YzdlZWY3OWRiMWEzOWJiM2JhZDViZDFhOWI3NWFkM2VkMDkzZDU3NDU4NWZhN2FhMmM1NDRkYTViZDk5MWRkZWY4MDI3N2YwODZjNDAxMjdlODFiNTkxMDY1OWE0YmE5ZDIzNGM0MWMwZDIyODFj"
        },
        frame: {
            version: "1",
            name: "tap",
            iconUrl: "https://i.imgur.com/8Knijje.png",
            splashImageUrl: "https://i.imgur.com/8Knijje.png",
            splashBackgroundColor: "#000000",
            homeUrl: "https://tap.computer",
        }
    };
    return Response.json(config);
}