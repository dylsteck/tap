import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="rounded-3xl shadow-xl p-6 max-w-sm border border-gray-300 bg-white hover:shadow-2xl transition-all">
      <div className="flex items-center space-x-4">
        <Image src={app.image_url} alt={app.name} width={60} height={60} className="rounded-xl" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{app.name}</h2>
          <p className="text-sm text-gray-500">{app.tag}</p>
        </div>
      </div>
      <CardContent className="mt-4">
        <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-4">{app.description}</p>
        <div className="flex space-x-3 overflow-x-scroll scrollbar-hide p-2">
          {app.screenshots.map((src, index) => (
            <Image key={index} src={src} alt={`Screenshot ${index + 1}`} width={140} height={260} className="rounded-lg border shadow-sm flex-none" />
          ))}
        </div>
        <Button asChild className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-2 rounded-xl">
          <a href={app.url} target="_blank" rel="noopener noreferrer">View</a>
        </Button>
      </CardContent>
    </Card>
  );
}