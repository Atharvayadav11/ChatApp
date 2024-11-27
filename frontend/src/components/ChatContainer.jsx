import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markConversationAsRead,
    conversationReadStatus,
    typingStatus
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Trigger marking as read when messages change
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      // Only mark messages as read if the last message is not from the current user
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== authUser._id) {
        markConversationAsRead(selectedUser._id);
      }
    }
  }, [messages, selectedUser?._id, authUser?._id]);

  // Fetch messages and subscribe to socket events
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // No user selected state
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            
            <div className="chat-header mb-1 flex items-center">
              <time className="text-xs opacity-50 mr-2">
                {formatMessageTime(message.createdAt)}
              </time>
              {message.senderId === authUser._id && message.status === 'read' && (
                <span className="text-xs text-green-500">Seen</span>
              )}
            </div>
            
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typingStatus[selectedUser._id] && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-primary bg-base-300 text-base-content">
              {selectedUser.fullName || selectedUser.username} is typing...
            </div>
          </div>
        )}

        {/* Ref for auto-scrolling */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;