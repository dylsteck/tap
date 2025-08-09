import { BASE_URL } from "../../../lib/utils";
import { ICON_IMG_URL } from "@tap/common";

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
      iconUrl: ICON_IMG_URL,
      splashImageUrl: ICON_IMG_URL,
      splashBackgroundColor: "#000000",
      homeUrl: `${BASE_URL}/videos`,
    },
    "baseBuilder": {
      "allowedAddresses": ["0x8342A48694A74044116F330db5050a267b28dD85"],
    }
  };
  return Response.json(config);
}