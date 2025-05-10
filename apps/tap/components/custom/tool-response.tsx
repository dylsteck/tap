/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@workspace/ui/components/drawer";
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";


import PreviewBadge from "./preview-badge";


export function ToolResponse({ badgeTitle, bodyTitle, images, items, renderItem, keyExtractor }: { badgeTitle: string, bodyTitle: string, images: string[], items: any, renderItem: (item: any) => React.ReactNode, keyExtractor: (item: any) => string }) {
 const [isOpen, setIsOpen] = useState<boolean>(false);
 const isDesktop = useMediaQuery("(min-width: 640px)")
 // note: 640px = sm in Tailwind
 
 return (
   <div className="relative">
     <PreviewBadge title={badgeTitle} images={images} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
     <ToolResponseBody
       isDesktop={isDesktop}
       isOpen={isOpen}
       onClose={() => setIsOpen(false)}
       title={bodyTitle}
       items={items}
       renderItem={renderItem}
       keyExtractor={keyExtractor}
     />
   </div>
 )
}

function ToolResponseBody({ isDesktop, isOpen, onClose, title, items, renderItem, keyExtractor }: { isDesktop: boolean, isOpen: boolean, onClose: () => void, title: string, items: any[], renderItem: (item: any) => React.ReactNode, keyExtractor: (item: any) => string }) {
 if (!isOpen) return null
 if (isDesktop) {
   return (
     <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      exit={{ x: "100%" }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-[#09090b] text-black dark:text-white shadow-lg z-50 overflow-hidden"
    >
      <div className="sticky top-0 flex flex-row gap-2 items-center p-2.5 pb-1 z-50">
        <XIcon className="size-4 cursor-pointer" onClick={onClose} />
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="p-0 max-w-full overflow-y-auto h-full">
        {items.map((item, index) => (
          <div 
            key={keyExtractor(item)} 
            className={`flex items-center w-full ${index !== items.length - 1 ? 'border-b border-gray-400 pb-2 mb-2' : ''}`}
          >
            <span className="text-sm w-full">{renderItem(item)}</span>
          </div>
        ))}
      </div>
    </motion.div>
   )
 }
 return (
   <Drawer open={isOpen} onOpenChange={onClose}>
     <DrawerContent className="h-auto max-h-[60vh]">
       <div className="p-2 pt-0 space-y-2 max-w-full max-h-full overflow-y-scroll">
        <div className="w-full sticky top-0 bg-white dark:bg-[#09090b]">
          <p className="pl-2 pb-1 text-lg font-medium">{title}</p>
        </div>
        <div className="p-0 max-w-full overflow-y-auto h-full">
          {items.map((item, index) => (
            <div 
              key={keyExtractor(item)} 
              className={`flex flex-col w-full ${index !== items.length - 1 ? 'border-b border-gray-400 pb-2 mb-2' : ''}`}
            >
              <span className="text-sm size-full break-words">{renderItem(item)}</span>
            </div>
          ))}
        </div>
       </div>
     </DrawerContent>
   </Drawer>
 )
}