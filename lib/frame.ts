import { BANNER_IMG_URL, BASE_URL, ICON_IMG_URL } from "./utils";

export const createFrame = (title = "message tap", imageUrl = BANNER_IMG_URL, urlSuffix = "") => {
  return {
    version: "next",
    imageUrl: imageUrl,
    button: {
      title: title,
      action: {
        type: "launch_frame",
        name: "tap",
        url: `${BASE_URL}${urlSuffix}`,
        splashImageUrl: ICON_IMG_URL,
        splashBackgroundColor: "#000000",
      },
    },
  };
}