// types.ts


// LogPanel.tsx
import React from 'react';
import type { LogMessage } from '../ts/types';
import '../css/log_panel.css'
import type { MessageType } from '../types';

interface LogPanelProps {
  messages: LogMessage[];
  onShowMessage?: (message: LogMessage) => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ 
  messages, 
  onShowMessage 
}) => {
  const handleMessageClick = (message: LogMessage) => {
    onShowMessage?.(message);
  };


function getMessageMark(messageType: MessageType): string {
    switch (messageType) {
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'success': return '✅';
        default: return ''; // normal and other get no mark
    }
}

  return (
    <div className="log-panel">
      {messages.length === 0 ? (
        <div className="log-empty">No messages</div>
      ) : (
        <ul className="log-list">
          {[...messages].reverse().map((message, index) => (
            <li 
              key={index} 
              className="log-message"
              onClick={() => handleMessageClick(message)}
            >
              <span className="log-time">[{message.time}]</span>
              <span>{getMessageMark(message.messageType)}</span>
              <span className="log-text">{message.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogPanel;