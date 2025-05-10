import { motion } from 'framer-motion';

import { Cast } from '@/components/farcasterkit/react/cast';
import { Token } from '@/components/farcasterkit/react/ethereum/token';

import CastsTool from './tools/casts';
import EventsTool from './tools/events';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { Skeleton } from '@workspace/ui/components/skeleton';
import BountiesTool from './tools/bounties';
import ClankerTrendingTool from './tools/clanker-trending';

export const Tool = ({ result, toolName }: {result: any, toolName: string}) => {

    const roundedElement = (element: React.ReactElement) => {
      return(
        <div className="rounded-xl border border-black dark:border-white">
          {element}
        </div>
      )
    }

    const renderTool = () => {
      switch (toolName) {
        case 'analyzeCast':
          return roundedElement(<Cast cast={result} />);
        case 'castSearch':
          return <CastsTool casts={result} />;
        case 'getClanker': 
          return <Token token={result} />
        case 'getTrendingClankers':
          return <ClankerTrendingTool clankers={result} />;
        case 'getUserCasts':
          return <CastsTool casts={result} />;
        case 'getTrendingCasts':
          return <CastsTool casts={result} />;
        case 'getChannelsCasts':
          return <CastsTool casts={result} />;
        case 'getEvents':
          return <EventsTool events={result} />;
        case 'getBounties':
          return <BountiesTool bounties={result} />
        default:
          return <Skeleton className="w-full h-auto" />;
      }
    }

    return (
      <div>
        {renderTool()}
      </div>
    );
  }
  
export const ToolPreview = () => {
  return (
    <motion.h2
      className="relative inline-block text-lg font-medium text-zinc-600 dark:text-zinc-300"
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
      initial={{ backgroundPosition: '100% 0' }}
      animate={{ 
        backgroundPosition: ['100% 0', '-100% 0'],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    >
      Searching...
    </motion.h2>
  );
}