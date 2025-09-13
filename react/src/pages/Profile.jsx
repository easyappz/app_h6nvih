import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Space, Avatar, List, Empty, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { me as fetchMe } from '../api/auth';
import { getUser } from '../api/users';
import { getUserPosts } from '../api/posts';

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const params = useParams();
  const routeId = params.id || null;

  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe, enabled: !routeId });
  const effectiveUserId = routeId || meQuery.data?.user?._id || null;

  const userQuery = useQuery({
    queryKey: ['user', effectiveUserId],
    queryFn: () => getUser(effectiveUserId),
    enabled: Boolean(effectiveUserId),
  });

  const postsQuery = useQuery({
    queryKey: ['user-posts', effectiveUserId],
    queryFn: () => getUserPosts(effectiveUserId, { page: 1, limit: 10 }),
    enabled: Boolean(effectiveUserId),
  });

  if (!effectiveUserId) return <Spin />;

  const user = userQuery.data?.user;
  const posts = postsQuery.data?.posts || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card>
        <Space>
          <Avatar size={64} src={user?.avatarUrl} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ margin: 0 }}>{user?.name || user?.username}</Title>
            <Text type="secondary">@{user?.username}</Text>
            {user?.bio && <Paragraph style={{ marginTop: 8 }}>{user.bio}</Paragraph>}
          </div>
        </Space>
      </Card>

      <Card title="Публикации">
        <List
          dataSource={posts}
          locale={{ emptyText: <Empty description="Пока нет публикаций" /> }}
          renderItem={(post) => (
            <List.Item key={post._id}>
              <div>
                <Text>{post.text}</Text>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};

export default Profile;
