import React from 'react';
import { Card, List, Space, Tabs, Empty, Spin, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { me as fetchMe } from '../api/auth';
import { listFriends, listRequests, acceptRequest, removeFriend } from '../api/friends';
import FriendCard from '../components/friends/FriendCard';
import FriendRequestItem from '../components/friends/FriendRequestItem';

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
      <Tabs
        defaultActiveKey="friends"
        items={[
          {
            key: 'friends',
            label: 'Мои друзья',
            children: (
              <Card>
                <List
                  dataSource={friends}
                  locale={{ emptyText: <Empty description="Пока нет друзей" /> }}
                  renderItem={(u) => (
                    <List.Item key={u._id}>
                      <FriendCard user={u} onRemove={(id) => removeMutation.mutate(id)} />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
          {
            key: 'requests',
            label: 'Заявки',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <Card title="Входящие">
                  <List
                    dataSource={incoming}
                    locale={{ emptyText: <Empty description="Нет входящих заявок" /> }}
                    renderItem={(u) => (
                      <List.Item key={u._id}>
                        <FriendRequestItem user={u} type="incoming" onAccept={(id) => acceptMutation.mutate(id)} />
                      </List.Item>
                    )}
                  />
                </Card>
                <Card title="Исходящие">
                  <List
                    dataSource={outgoing}
                    locale={{ emptyText: <Empty description="Нет исходящих заявок" /> }}
                    renderItem={(u) => (
                      <List.Item key={u._id}>
                        <FriendRequestItem user={u} type="outgoing" />
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
};

export default Friends;
