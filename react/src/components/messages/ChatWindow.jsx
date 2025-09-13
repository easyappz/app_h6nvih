import React, { useState } from 'react';
import { Card, List, Typography, Input, Button, Space, Empty, Spin, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getThread, sendMessage } from '../../api/messages';
import { me as fetchMe } from '../../api/auth';

const { Text } = Typography;

const ChatWindow = ({ userId }) => {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const myId = meQuery.data?.user?._id;

  const threadQuery = useQuery({
    queryKey: ['thread', userId],
    queryFn: () => getThread(userId, { page: 1, limit: 20 }),
    enabled: Boolean(userId),
  });

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(userId, { text }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['thread', userId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => message.error('Не удалось отправить сообщение'),
  });

  if (!userId) {
    return (
      <Card title="Сообщения" style={{ width: '100%', minHeight: 420 }}>
        <Empty description="Выберите диалог" />
      </Card>
    );
  }

  return (
    <Card title="Сообщения" style={{ width: '100%', minHeight: 420 }}>
      {threadQuery.isLoading ? (
        <Spin />
      ) : (
        <>
          <List
            dataSource={threadQuery.data?.messages || []}
            renderItem={(m) => (
              <List.Item key={m._id} style={{ justifyContent: m.from === myId ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: m.from === myId ? '#E6F4FF' : '#F5F5F5', padding: '8px 12px', borderRadius: 8, maxWidth: '70%' }}>
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
            <Button type="primary" onClick={() => text.trim() && sendMutation.mutate()} loading={sendMutation.isLoading}>Отправить</Button>
          </Space.Compact>
        </>
      )}
    </Card>
  );
};

export default ChatWindow;
