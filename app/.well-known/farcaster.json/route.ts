import { BASE_URL, ICON_IMG_URL } from "../../../lib/utils";

export async function GET() {
  const config = {
    "accountAssociation": {
      "header": "eyJmaWQiOjYxNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDVFNzlGNjkwY2NENDIwMDdENUEwYUQ2NzhDRDQ3NDc0MzM5NDAwRTMifQ",
      "payload": "eyJkb21haW4iOiJ3aXRoY29ydGV4LmNvbSJ9",
      "signature": "MHhiNWQwM2EyMGFjM2I1NDJkYWY0M2I3Y2NiODkzMDJhMTZkMzM5YTQwMjRjYzdkNzYxN2Q5ZGIwYTQ5YzVmYTEyMGJmYTEwNjBlZTZmMDg3MWQ3OTM2YTI4ODZjMjM0MjViMDk4OGE1MjlkNzVlMDUwNWVkOTE4MDZlMDE1ZjNlYjFj"
    },
    frame: {
      version: "0.0.1",
      name: "tap",
      iconUrl: ICON_IMG_URL,
      splashImageUrl: ICON_IMG_URL,
      splashBackgroundColor: "#000000",
      homeUrl: BASE_URL,
    },
  };

  return Response.json(config);
}