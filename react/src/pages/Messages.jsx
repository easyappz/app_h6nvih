import React, { useState } from 'react';
import { Space } from 'antd';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';

const Messages = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <Space align="start" style={{ width: '100%' }} size={16}>
      <ConversationList selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
      <ChatWindow userId={selectedUserId} />
    </Space>
  );
};

export default Messages;
