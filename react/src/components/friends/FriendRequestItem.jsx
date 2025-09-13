import React from 'react';
import { Avatar, Button, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FriendRequestItem = ({ user, type = 'incoming', onAccept }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
      <Space>
        <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
        <div>
          <Text strong>{user?.name || user?.username}</Text>
          {user?.username && <div style={{ color: '#8c8c8c' }}>@{user.username}</div>}
        </div>
      </Space>
      {type === 'incoming' ? (
        <Button type="primary" onClick={() => onAccept && onAccept(user._id)}>Принять</Button>
      ) : (
        <Button disabled>Ожидает</Button>
      )}
    </div>
  );
};

export default FriendRequestItem;
