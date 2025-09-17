import React from "react";
import {
  MessageContentBlock,
  isTextContentBlock,
  isImageContentBlock,
  isComputerToolUseContentBlock,
  isToolResultContentBlock,
} from "@bytebot/shared";
import { TextContent } from "./TextContent";
import { ImageContent } from "./ImageContent";
import { ComputerToolContent } from "./ComputerToolContent";
import { ErrorContent } from "./ErrorContent";

interface MessageContentProps {
  content: MessageContentBlock[];
  isTakeOver?: boolean;
}

export function MessageContent({
  content,
  isTakeOver = false,
}: MessageContentProps) {
  // Show all content blocks including tool calls for better visibility
  const visibleBlocks = content.filter((block: MessageContentBlock) => {
    // Always show errors, images, and text blocks
    if (
      isToolResultContentBlock(block) &&
      (block.is_error || 
       (block.content && block.content.some((contentBlock: MessageContentBlock) => isImageContentBlock(contentBlock))))
    ) {
      return true;
    }
    // Always show computer tool use blocks to display what agent is doing
    if (isComputerToolUseContentBlock(block)) {
      return true;
    }
    // Always show text blocks for thinking/reasoning
    if (isTextContentBlock(block)) {
      return true;
    }
    return true; // Show all blocks by default for better transparency
  });

  // Skip rendering if no visible content
  if (visibleBlocks.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {visibleBlocks.map((block, index) => (
        <div key={index}>
          {isTextContentBlock(block) && <TextContent block={block} />}

          {isToolResultContentBlock(block) &&
            !block.is_error &&
            block.content.map((contentBlock: MessageContentBlock, contentBlockIndex: number) => {
              if (isImageContentBlock(contentBlock)) {
                return (
                  <ImageContent key={contentBlockIndex} block={contentBlock} />
                );
              }
              return null;
            })}

          {isComputerToolUseContentBlock(block) && (
            <ComputerToolContent block={block} isTakeOver={isTakeOver} />
          )}

          {isToolResultContentBlock(block) && block.is_error && (
            <ErrorContent block={block} />
          )}

          {isToolResultContentBlock(block) &&
            !block.is_error &&
            block.tool_use_id === "set_task_status" &&
            block.content?.[0].type === "text" && (
              <TextContent block={block.content?.[0]} />
            )}
        </div>
      ))}
    </div>
  );
}
