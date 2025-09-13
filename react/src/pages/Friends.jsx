import React from 'react';
import { Card, List, Button, Space, Typography, Empty, Spin, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { me as fetchMe } from '../api/auth';
import { listFriends, listRequests, acceptRequest, removeFriend } from '../api/friends';

const { Text } = Typography;

const Friends = () => {
  const qc = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const userId = meQuery.data?.user?._id;

  const friendsQuery = useQuery({
    queryKey: ['friends', userId],
    queryFn: () => listFriends(userId),
    enabled: Boolean(userId),
  });

  const requestsQuery = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => listRequests(),
    enabled: Boolean(userId),
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => acceptRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => message.error('Не удалось подтвердить запрос'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeFriend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      message.success('Удалено из друзей');
    },
    onError: () => message.error('Не удалось удалить из друзей'),
  });

  if (!userId) return <Spin />;

  const friends = friendsQuery.data?.friends || [];
  const incoming = requestsQuery.data?.incoming || [];
  const outgoing = requestsQuery.data?.outgoing || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card title="Друзья">
        <List
          dataSource={friends}
          locale={{ emptyText: <Empty description="Пока нет друзей" /> }}
          renderItem={(u) => (
            <List.Item key={u._id}
              actions={[<Button danger onClick={() => removeMutation.mutate(u._id)}>Удалить</Button>]}
            >
              <Text>{u.name || u.username}</Text>
            </List.Item>
          )}
        />
      </Card>

      <Card title="Входящие заявки">
        <List
          dataSource={incoming}
          locale={{ emptyText: <Empty description="Нет входящих заявок" /> }}
          renderItem={(u) => (
            <List.Item key={u._id}
              actions={[<Button type="primary" onClick={() => acceptMutation.mutate(u._id)}>Принять</Button>]}
            >
              <Text>{u.name || u.username}</Text>
            </List.Item>
          )}
        />
      </Card>

      <Card title="Исходящие заявки">
        <List
          dataSource={outgoing}
          locale={{ emptyText: <Empty description="Нет исходящих заявок" /> }}
          renderItem={(u) => (
            <List.Item key={u._id}>
              <Text>{u.name || u.username}</Text>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};

export default Friends;
