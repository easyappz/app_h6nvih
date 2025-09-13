import React from 'react';
import { Card, List, Typography, Empty, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../../api/messages';
import { me as fetchMe } from '../../api/auth';

const { Text } = Typography;

const ConversationList = ({ selectedUserId, onSelect }) => {
  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const { data, isLoading } = useQuery({ queryKey: ['conversations'], queryFn: getConversations });
  const myId = meQuery.data?.user?._id;
  const conversations = data?.conversations || [];

  const getOther = (conv) => {
    const members = conv.members || [];
    const other = members.find((m) => m._id !== myId) || members[0];
    return other;
  };

  return (
    <Card title="Диалоги" style={{ width: 320, flexShrink: 0 }}>
      {isLoading ? (
        <Spin />
      ) : (
        <List
          dataSource={conversations}
          locale={{ emptyText: <Empty description="Нет диалогов" /> }}
          renderItem={(c) => {
            const other = getOther(c);
            const active = selectedUserId && other?._id === selectedUserId;
            return (
              <List.Item
                key={c._id}
                onClick={() => onSelect && onSelect(other?._id)}
                style={{ cursor: 'pointer', background: active ? '#E6F4FF' : 'transparent', borderRadius: 6 }}
              >
                <List.Item.Meta
                  title={<Text strong>{other?.name || other?.username || 'Пользователь'}</Text>}
                  description={c.lastMessage || 'Сообщений пока нет'}
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default ConversationList;
