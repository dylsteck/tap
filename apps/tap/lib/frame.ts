import { BANNER_IMG_URL, BASE_URL, ICON_IMG_URL } from "./utils";

// note: think about when to cycle title between 'message tap', 'watch videos', and 'open tap'
export const createFrame = (title = "watch videos", imageUrl = BANNER_IMG_URL, urlSuffix = "/videos") => {
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