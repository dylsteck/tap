import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 flex justify-center items-center"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-4 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-1 items-center">
          <span className="text-2xl font-semibold">tap</span>
        </p>
        <Link href="/videos">
          <Button className="rounded-xl flex flex-row gap-2 items-center" variant="default">
            <Film className="size-5" />
            Watch Videos
          </Button>
        </Link>
      </div>
    </motion.div>
  )
};