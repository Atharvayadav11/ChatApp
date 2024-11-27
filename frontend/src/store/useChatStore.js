import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  conversationReadStatus: {},
  typingStatus: {}, 

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

 
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Handle new messages
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = 
        newMessage.senderId === selectedUser._id || 
        newMessage.receiverId === selectedUser._id;
      
      if (isMessageSentFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });
    socket.on('user-typing', (data) => {
      // Only update typing status if the typing user is the selected user
      if (data.senderId === selectedUser._id) {
        set({
          typingStatus: {
            ...get().typingStatus,
            [data.senderId]: data.isTyping
          }
        });
      }
    });
  
    // Handle conversation read status updates
    socket.on('conversation-read', (data) => {
      // Update messages status if the conversation partner matches
      if (data.conversationPartnerId === selectedUser._id) {
        const updatedMessages = get().messages.map(message => ({
          ...message,
          status: data.status
        }));

        // Update messages and conversation read status
        set({ 
          messages: updatedMessages,
          conversationReadStatus: {
            ...get().conversationReadStatus,
            [data.conversationPartnerId]: data.status
          }
        });
      }
    });
  },

  emitTypingStatus: (isTyping) => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;

    if (selectedUser && socket) {
      socket.emit(isTyping ? 'typing' : 'stop-typing', {
        senderId: authUser._id,
        receiverId: selectedUser._id
      });
    }
  },

  markConversationAsRead: async (senderId) => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    
    try {
      // Emit socket event to mark conversation as read
      socket.emit('mark-conversation-read', {
        senderId,
        receiverId: authUser._id
      });

      // Optional: Also make HTTP request for backend sync
      await axiosInstance.post(`/messages/mark-read/${senderId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark messages as read');
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("conversation-read");
  },



  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));