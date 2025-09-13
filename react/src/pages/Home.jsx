import React, { useState } from 'react';
import { Typography, Button, Card, Input, List, Empty, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchUsers } from '../api/users';
import { sendRequest } from '../api/friends';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState('');

  const searchQuery = useQuery({
    queryKey: ['search-users', q],
    queryFn: () => searchUsers(q),
    enabled: q.trim().length >= 2,
  });

  const sendReq = useMutation({
    mutationFn: (id) => sendRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });

  const users = searchQuery.data?.users || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card>
        <Title level={2} style={{ marginTop: 0 }}>Добро пожаловать!</Title>
        <Paragraph>
          Это стартовая страница вашего приложения. Перейдите в ленту, чтобы посмотреть публикации друзей, или начните общаться в сообщениях.
        </Paragraph>
        <Space>
          <Button type="primary" onClick={() => navigate('/feed')}>Перейти в ленту</Button>
          <Button onClick={() => navigate('/friends')}>Мои друзья</Button>
          <Button onClick={() => navigate('/messages')}>Сообщения</Button>
        </Space>
      </Card>

      <Card title="Кого добавить в друзья">
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Input placeholder="Поиск пользователей" value={q} onChange={(e) => setQ(e.target.value)} />
          <List
            dataSource={users}
            loading={searchQuery.isFetching}
            locale={{ emptyText: <Empty description={q.trim().length < 2 ? 'Введите минимум 2 символа' : 'Никого не найдено'} /> }}
            renderItem={(u) => (
              <List.Item key={u._id} actions={[<Button type="primary" onClick={() => sendReq.mutate(u._id)} loading={sendReq.isLoading}>Добавить</Button>] }>
                <Text strong>{u.name || u.username}</Text>
                <div style={{ color: '#8c8c8c' }}>@{u.username}</div>
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </Space>
  );
};

export default Home;
