import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ipAddress } from '../../constants/ip';
import '../../assets/css/Message.css';

interface User {
  userId: string;
  email: string;
  full_name?: string;
  avatar?: string;
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

interface ReceiveMessage extends Message {
  user: User;
}

interface RecentMessage {
  user: User;
  message: Message;
}

const socket: Socket = io(`${ipAddress}`, {
  transports: ['websocket'],
});

const Message: React.FC = () => {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<User[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [newMessageUsers, setNewMessageUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchAdminId = () => {
      try {
        const storedAdminData = localStorage.getItem('adminData');
        if (storedAdminData) {
          const parsedAdminData = JSON.parse(storedAdminData);
          const id = parsedAdminData._id;
          if (id) {
            setAdminId(id);
          } else {
            console.error('Không tìm thấy _id trong adminData');
          }
        } else {
          console.error('Không tìm thấy adminData trong localStorage');
        }
      } catch (error) {
        console.error('Lỗi khi lấy adminId từ localStorage:', error);
      }
    };

    fetchAdminId();
  }, []);

  const loadUserMessages = async (user: User, retryCount = 0) => {
    try {
      const response = await fetch(`${ipAddress}/api/messages/${user.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy lịch sử tin nhắn');
      }

      if (data.success) {
        // Chỉ cập nhật nếu messages khác với trạng thái hiện tại
        setMessages((prev) => {
          const prevIds = prev.map((msg) => msg.timestamp);
          const newMessages = data.messages.filter(
            (msg: Message) => !prevIds.includes(msg.timestamp)
          );
          return [...prev, ...newMessages];
        });
        setSelectedUser(user);
        setNewMessageUsers((prev) => prev.filter((id) => id !== user.userId));
      }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
      if (retryCount < 3) {
        setTimeout(() => loadUserMessages(user, retryCount + 1), 1000);
      }
    }
  };

  // Tự động gọi loadUserMessages mỗi 1 giây
  useEffect(() => {
    if (!adminId || !selectedUser) return;

    const interval = setInterval(() => {
      console.log(`Polling messages for user: ${selectedUser.userId}`);
      loadUserMessages(selectedUser);
    }, 1000);

    return () => clearInterval(interval); // Dọn dẹp khi selectedUser thay đổi hoặc component unmount
  }, [adminId, selectedUser]);

  useEffect(() => {
    if (!adminId) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`${ipAddress}/api/conversations/${adminId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi lấy danh sách cuộc trò chuyện');
        }

        if (data.success) {
          setConversations(data.conversations);
          console.log(conversations);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', error);
      }
    };

    const fetchRecentMessages = async () => {
      try {
        const response = await fetch(`${ipAddress}/api/recent-messages/${adminId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Lỗi khi lấy tin nhắn gần đây');
        }

        if (data.success) {
          setRecentMessages(data.recentMessages);
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn gần đây:', error);
      }
    };

    fetchConversations();
    fetchRecentMessages();

    socket.emit('register', { userId: adminId, role: 'admin' });
    socket.on('connect', () => {
      console.log('Socket connected, registering admin:', adminId);
      socket.emit('register', { userId: adminId, role: 'admin' });
    });

    socket.on('receiveMessage', ({ user, ...newMessage }: ReceiveMessage) => {
      console.log('Received message:', { user, newMessage });
      if (selectedUser?.userId === user.userId) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        setMessages([newMessage]);
        setSelectedUser(user);
        loadUserMessages(user);
        setNewMessageUsers((prev) => [...prev, user.userId]);
      }

      setRecentMessages((prev) => {
        const existingIndex = prev.findIndex((msg) => msg.user.userId === user.userId);
        const updatedMessage = { user, message: newMessage };
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedMessage;
          return updated;
        } else {
          return [updatedMessage, ...prev].slice(0, 10);
        }
      });

      setConversations((prev) => {
        const exists = prev.some((u) => u.userId === user.userId);
        if (!exists) {
          return [user, ...prev];
        }
        return prev;
      });
    });

    socket.on('error', ({ message }: { message: string }) => {
      console.error('Socket error:', message);
    });

    return () => {
      socket.off('connect');
      socket.off('receiveMessage');
      socket.off('error');
    };
  }, [adminId, selectedUser]);

  const sendMessage = () => {
    if (message.trim() && selectedUser && adminId) {
      const newMessage = {
        userId: selectedUser.userId,
        sender: `admin:${adminId}`,
        receiver: `user:${selectedUser.userId}`,
        content: message,
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setRecentMessages((prev) => {
        const existingIndex = prev.findIndex((msg) => msg.user.userId === selectedUser.userId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = { user: selectedUser, message: newMessage };
          return updated;
        } else {
          return [{ user: selectedUser, message: newMessage }, ...prev].slice(0, 10);
        }
      });
      setMessage('');
    }
  };

  return (
    <div className="messenger-container">
      {adminId ? (
        <div className="messenger-layout">
          <div className="chat-list">
            <div className="chat-header">
              <h3>Đoạn chat</h3>
              <input type="text" placeholder="Tìm kiếm trên Messenger" className="search-bar" />
            </div>
            <div className="chat-items">
              {recentMessages.length > 0 ? (
                recentMessages.map((recent) => (
                  <div
                    key={recent.user.userId}
                    className={`chat-item ${
                      selectedUser?.userId === recent.user.userId ? 'active' : ''
                    } ${newMessageUsers.includes(recent.user.userId) ? 'new-message' : ''}`}
                    onClick={() => loadUserMessages(recent.user)}
                  >
                    <img
                      src={recent.user.avatar || 'https://via.placeholder.com/40'}
                      alt="Avatar"
                      className="chat-avatar"
                    />
                    <div className="chat-info">
                      <div className="chat-name">{recent.user.full_name || recent.user.email}</div>
                      <div className="chat-preview">{recent.message.content}</div>
                    </div>
                    <div className="chat-time">
                      {new Date(recent.message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-chats">Chưa có tin nhắn nào</p>
              )}
            </div>
          </div>

          <div className="chat-area">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  <img
                    src={selectedUser.avatar || 'https://via.placeholder.com/40'}
                    alt="Avatar"
                    className="chat-avatar"
                  />
                  <h3>{selectedUser.full_name || selectedUser.email}</h3>
                </div>
                <div className="messages">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.sender.includes('admin') ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="input-area">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Aa"
                    className="message-input"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="send-btn">Gửi</button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="loading-text">Đang tải thông tin admin...</p>
      )}
    </div>
  );
};

export default Message;

