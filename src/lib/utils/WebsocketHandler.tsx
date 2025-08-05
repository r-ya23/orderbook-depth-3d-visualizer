"use client";

import { useWebSocket } from "@/hooks/useWebSocket";

const WebSocketHandler = ({ venue }: { venue: string }) => {
  useWebSocket({ venue });
  return null;
};

export default WebSocketHandler;
