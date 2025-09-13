import React, { useMemo, useState } from 'react';
import { Card, List, Typography, Input, Button, Space, Empty, Spin, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getThread, sendMessage } from '../api/messages';
import { me as fetchMe } from '../api/auth';

const { Text } = Typography;

const Messages = () => {
  const qc = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [text, setText] = useState('');
  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  const conversationsQuery = useQuery({ queryKey: ['conversations'], queryFn: getConversations });

  const threadQuery = useQuery({
    queryKey: ['thread', selectedUserId],
    queryFn: () => getThread(selectedUserId, { page: 1, limit: 20 }),
    enabled: Boolean(selectedUserId),
  });

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(selectedUserId, { text }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['thread', selectedUserId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => message.error('Не удалось отправить сообщение'),
  });

  const conversations = conversationsQuery.data?.conversations || [];

  const myId = meQuery.data?.user?._id;

  const otherMember = (conv) => {
    const members = conv.members || [];
    const other = members.find((m) => m._id !== myId) || members[0];
    return other;
  };

  return (
    <Space align="start" style={{ width: '100%' }} size={16}>
      <Card title="Диалоги" style={{ width: 320, flexShrink: 0 }}>
        {conversationsQuery.isLoading ? (
          <Spin />
        ) : (
          <List
            dataSource={conversations}
            locale={{ emptyText: <Empty description="Нет диалогов" /> }}
            renderItem={(c) => {
              const other = otherMember(c);
              return (
                <List.Item key={c._id} onClick={() => setSelectedUserId(other?._id)} style={{ cursor: 'pointer' }}>
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

      <Card title="Сообщения" style={{ width: '100%', minHeight: 420 }}>
        {!selectedUserId ? (
          <Empty description="Выберите диалог" />
        ) : threadQuery.isLoading ? (
          <Spin />
        ) : (
          <>
            <List
              dataSource={threadQuery.data?.messages || []}
              renderItem={(m) => (
                <List.Item key={m._id} style={{ justifyContent: m.from === myId ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: m.from === myId ? '#E6F4FF' : '#F5F5F5', padding: '8px 12px', borderRadius: 8 }}>
                    <Text>{m.text}</Text>
                  </div>
                </List.Item>
              )}
            />
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={text}
                placeholder="Введите сообщение"
                onChange={(e) => setText(e.target.value)}
                onPressEnter={() => text.trim() && sendMutation.mutate()}
              />
              <Button type="primary" onClick={() => text.trim() && sendMutation.mutate()}>Отправить</Button>
            </Space.Compact>
          </>
        )}
      </Card>
    </Space>
  );
};

export default Messages;
