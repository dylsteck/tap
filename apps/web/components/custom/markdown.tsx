import Link from "next/link";
import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  return markdown.split(/\n\n/).filter(block => block.trim() !== '');
}

const MemoizedMarkdownBlock = memo(
  ({ children }: { children: string }) => {
    const components = {
      code: ({ node, inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <pre
            {...props}
            className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
          >
            <code className={match[1]}>{children}</code>
          </pre>
        ) : (
          <code
            className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
            {...props}
          >
            {children}
          </code>
        );
      },
      ol: ({ node, children, ...props }: any) => {
        return (
          <ul className="list-disc list-outside ml-4" {...props}>
            {children}
          </ul>
        );
      },
      li: ({ node, children, ...props }: any) => {
        return (
          <li className="py-1" {...props}>
            {children}
          </li>
        );
      },
      ul: ({ node, children, ...props }: any) => {
        return (
          <ul className="list-disc list-outside ml-4" {...props}>
            {children}
          </ul>
        );
      },
      strong: ({ node, children, ...props }: any) => {
        return (
          <span className="font-semibold" {...props}>
            {children}
          </span>
        );
      },
      a: ({ node, children, ...props }: any) => {
        return (
          <Link
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noreferrer"
            {...props}
          >
            {children}
          </Link>
        );
      },
      img: ({ node, src, alt, ...props }: any) => {
        // return (
        //   <img
        //     src={src}
        //     alt={alt || ""}
        //     className="rounded-lg my-4 object-contain max-w-full h-auto"
        //     {...props}
        //   />
        // );
        return (<></>)
      },
    };

    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const Markdown = memo(
  ({ children }: { children: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock key={`markdown-block-${index}`}>{block}</MemoizedMarkdownBlock>
    ));
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Markdown.displayName = 'Markdown';
