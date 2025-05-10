import { Avatar, AvatarFallback, AvatarImage } from "@tap/ui/components/avatar";
import { Badge } from "@tap/ui/components/badge";

export default function PreviewBadge({ title, images, isOpen, onClick }: { title: string, images: string[], isOpen: boolean, onClick: () => void }) {
    return (
      <Badge variant="secondary" className={`h-9 gap-1 px-3 bg-zinc-900 text-white hover:bg-zinc-900 cursor-pointer ${isOpen ? 'border border-foreground/40' : 'border-none'}`} onClick={onClick}>
        <div className="flex -space-x-2">
          {images.slice(0, 4).map((image, index) => (
            <Avatar key={index} className="size-5 border border-black">
              <AvatarImage src={image} />
              <AvatarFallback>{index}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="text-sm font-normal">{title}</span>
      </Badge>
    ) 
  }