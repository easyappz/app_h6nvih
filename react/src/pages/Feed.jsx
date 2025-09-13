import React, { useState } from 'react';
import { List, Pagination, Empty, Spin, Result } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeed } from '../api/posts';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';

const Feed = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed', page, limit],
    queryFn: () => getFeed({ page, limit }),
    keepPreviousData: true,
  });

  if (isLoading) return <Spin />;
  if (isError) return <Result status="error" title="Ошибка" subTitle="Не удалось загрузить ленту" />;

  const posts = data?.posts || [];

  return (
    <div>
      <CreatePost onCreated={() => queryClient.invalidateQueries({ queryKey: ['feed'] })} />
      <List
        dataSource={posts}
        locale={{ emptyText: <Empty description="Публикаций пока нет" /> }}
        renderItem={(post) => (
          <List.Item key={post._id}>
            <PostCard post={post} onChanged={() => queryClient.invalidateQueries({ queryKey: ['feed'] })} />
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
