import React, { useEffect, useState, useRef } from 'react';
import { Cursor } from '../types';

interface CursorOverlayProps {
  cursors: Cursor[];
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  code: string;
}

interface CursorPosition {
  top: number;
  left: number;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({ cursors, textareaRef, code }) => {
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textareaRef.current || !overlayRef.current) return;

    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    
    const updateCursorPositions = () => {
      const newPositions = new Map<string, CursorPosition>();
      
      cursors.forEach((cursor) => {
        const position = getCaretCoordinates(textarea, cursor.position);
        newPositions.set(cursor.userId, position);
      });
      
      setCursorPositions(newPositions);
    };

    updateCursorPositions();
    
    // Update positions when textarea scrolls
    textarea.addEventListener('scroll', updateCursorPositions);
    
    return () => {
      textarea.removeEventListener('scroll', updateCursorPositions);
    };
  }, [cursors, textareaRef, code]);

  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number): CursorPosition => {
    const div = document.createElement('div');
    const style = getComputedStyle(element);
    
    // Copy textarea styles to div
    [
      'font-family', 'font-size', 'font-weight', 'line-height',
      'letter-spacing', 'padding-left', 'padding-top', 'border-left-width',
      'border-top-width', 'word-wrap', 'white-space'
    ].forEach(prop => {
      div.style[prop as any] = style[prop as any];
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.width = element.clientWidth + 'px';
    div.style.height = element.clientHeight + 'px';
    div.style.overflow = 'hidden';
    
    document.body.appendChild(div);
    
    const text = element.value;
    const textBeforeCaret = text.substring(0, position);
    const span = document.createElement('span');
    span.textContent = textBeforeCaret;
    div.appendChild(span);
    
    const caretSpan = document.createElement('span');
    caretSpan.textContent = '|';
    div.appendChild(caretSpan);
    
    const rect = element.getBoundingClientRect();
    const caretRect = caretSpan.getBoundingClientRect();
    
    const top = caretRect.top - rect.top + element.scrollTop;
    const left = caretRect.left - rect.left + element.scrollLeft;
    
    document.body.removeChild(div);
    
    return { top, left };
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        top: textareaRef.current?.offsetTop || 0,
        left: textareaRef.current?.offsetLeft || 0,
      }}
    >
      {cursors.map((cursor) => {
        const position = cursorPositions.get(cursor.userId);
        if (!position) return null;
        
        return (
          <div
            key={cursor.userId}
            className="absolute animate-pulse"
            style={{
              top: position.top,
              left: position.left,
              transform: 'translateX(-1px)',
            }}
          >
            <div
              className="w-0.5 h-5 rounded-full"
              style={{ backgroundColor: cursor.user.color }}
            />
            <div
              className="absolute -top-6 left-0 px-2 py-1 text-xs text-white rounded-md whitespace-nowrap shadow-lg transform -translate-x-1/4"
              style={{ backgroundColor: cursor.user.color }}
            >
              {cursor.user.username}
            </div>
          </div>
        );
      })}
    </div>
  );
};