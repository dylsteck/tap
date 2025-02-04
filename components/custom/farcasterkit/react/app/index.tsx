import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import FrameLink from "../utils/frame-link";

type FarcasterAppProps = {
  name: string;
  tag: string;
  description: string;
  image_url: string;
  screenshots: string[];
  url: string;
};

export function FarcasterApp({ app }: { app: FarcasterAppProps }) {
  return (
    <Card className="w-full rounded-xl p-2 max-w-sm border border-gray-300 text-black dark:text-white">
      <div className="flex items-center space-x-2">
          <Image src={app.image_url} alt={app.name} width={60} height={60} className="rounded-lg size-6" loading="lazy" />
          <div className="flex flex-col gap-0">
          <h2 className="text-lg font-bold">{app.name}</h2>
          {app.tag.toLowerCase !== app.description.toLowerCase ? 
            <p className="text-sm">{app.tag}</p>
          : null}
          </div>
      </div>
      <CardContent className="my-2 ml-0 pl-0 pb-0">
        <p className="text-sm leading-relaxed line-clamp-3 pl-1">{app.description}</p>
        <div className="flex space-x-3 overflow-x-scroll scrollbar-hide p-2 pl-1 pb-0">
          {app.screenshots.map((src, index) => (
            <Image key={index} src={src} alt={`Screenshot ${index + 1}`} width={140} height={260} className="rounded-lg border border-black/80 dark:border-white/80 shadow-sm flex-none" />
          ))}
        </div>
        <Button className="w-full bg-black dark:bg-white text-white dark:text-black text-md rounded-xl mt-3">
          <div className="w-full">
            <FrameLink identifier={app.url} type="url">
              View
            </FrameLink>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}