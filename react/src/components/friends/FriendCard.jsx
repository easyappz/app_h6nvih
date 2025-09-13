import React from 'react';
import { Avatar, Button, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FriendCard = ({ user, onRemove }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
      <Space>
        <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
        <div>
          <Text strong>{user?.name || user?.username}</Text>
          {user?.username && <div style={{ color: '#8c8c8c' }}>@{user.username}</div>}
        </div>
      </Space>
      {onRemove && (
        <Button danger onClick={() => onRemove(user._id)}>Удалить</Button>
      )}
    </div>
  );
};

export default FriendCard;
