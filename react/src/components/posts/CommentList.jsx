import React, { useState } from 'react';
import { List, Input, Button, Space, Typography, Empty } from 'antd';

const { Text } = Typography;

const CommentList = ({ comments = [], onAdd, adding = false }) => {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd && onAdd(t, () => setText(''));
  };

  return (
    <div>
      <List
        size="small"
        dataSource={comments}
        locale={{ emptyText: <Empty description="Комментариев пока нет" /> }}
        renderItem={(c, idx) => (
          <List.Item key={idx} style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div>
              <Text strong>{c.user || 'Пользователь'}</Text>
              <div><Text>{c.text}</Text></div>
            </div>
          </List.Item>
        )}
      />
      <Space.Compact style={{ width: '100%', marginTop: 8 }}>
        <Input
          value={text}
          placeholder="Напишите комментарий"
          onChange={(e) => setText(e.target.value)}
          onPressEnter={submit}
        />
        <Button type="primary" onClick={submit} loading={adding}>Отправить</Button>
      </Space.Compact>
    </div>
  );
};

export default CommentList;
