import React, { useState } from 'react';
import { List, Card, Typography, Space, Button, Input, message, Pagination, Empty, Spin } from 'antd';
import { LikeOutlined, CommentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, toggleLike, addComment } from '../api/posts';

const { Text } = Typography;

const Feed = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed', page, limit],
    queryFn: () => getFeed({ page, limit }),
    keepPreviousData: true,
  });

  const likeMutation = useMutation({
    mutationFn: (id) => toggleLike(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
    onError: () => message.error('Не удалось поставить лайк'),
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => addComment(id, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
    onError: () => message.error('Не удалось добавить комментарий'),
  });

  if (isLoading) return <Spin />;
  if (isError) return <Empty description="Не удалось загрузить ленту" />;

  const posts = data?.posts || [];

  return (
    <div>
      <List
        dataSource={posts}
        locale={{ emptyText: <Empty description="Публикаций пока нет" /> }}
        renderItem={(post) => (
          <List.Item key={post._id}>
            <Card style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Автор: {post.author}</Text>
                <Text>{post.text}</Text>
                <Space>
                  <Button icon={<LikeOutlined />} onClick={() => likeMutation.mutate(post._id)}>
                    {post.likes?.length || 0}
                  </Button>
                </Space>
                <Space.Compact style={{ width: '100%' }}>
                  <Input placeholder="Напишите комментарий" onPressEnter={(e) => {
                    const text = e.target.value.trim();
                    if (!text) return;
                    commentMutation.mutate({ id: post._id, text });
                    e.target.value = '';
                  }} />
                  <Button icon={<CommentOutlined />} onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input');
                    if (input) input.focus();
                  }}>
                    Комментировать
                  </Button>
                </Space.Compact>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          current={data?.page || page}
          pageSize={data?.limit || limit}
          total={data?.total || 0}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default Feed;
