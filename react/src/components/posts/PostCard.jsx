import React from 'react';
import { Card, Typography, Space, Button, Image, message } from 'antd';
import { LikeOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleLike, addComment, deletePost } from '../../api/posts';
import { me as fetchMe } from '../../api/auth';
import CommentList from './CommentList';

const { Text } = Typography;

const PostCard = ({ post, onChanged }) => {
  const qc = useQueryClient();
  const { data: meData } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const myId = meData?.user?._id;

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post._id),
    onSuccess: () => {
      if (onChanged) onChanged();
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => message.error('Не удалось поставить лайк'),
  });

  const commentMutation = useMutation({
    mutationFn: (text) => addComment(post._id, { text }),
    onSuccess: () => {
      if (onChanged) onChanged();
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => message.error('Не удалось добавить комментарий'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      message.success('Публикация удалена');
      if (onChanged) onChanged();
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => message.error('Не удалось удалить публикацию'),
  });

  const liked = (post.likes || []).includes(myId);
  const canDelete = post.author === myId;

  return (
    <Card style={{ width: '100%' }} bodyStyle={{ paddingTop: 14 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <Text strong>Автор: {post.author || 'Пользователь'}</Text>
        {post.text && <Text>{post.text}</Text>}
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {post.images.map((url, i) => (
              <Image key={`${post._id}-${i}`} src={url} width={160} height={160} style={{ objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        )}
        <Space>
          <Button icon={<LikeOutlined />} type={liked ? 'primary' : 'default'} onClick={() => likeMutation.mutate()}>
            {post.likes?.length || 0}
          </Button>
          <Button icon={<CommentOutlined />} disabled>
            {post.comments?.length || 0}
          </Button>
          {canDelete && (
            <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isLoading} onClick={() => deleteMutation.mutate()}>
              Удалить
            </Button>
          )}
        </Space>
        <CommentList
          comments={post.comments || []}
          adding={commentMutation.isLoading}
          onAdd={(text, reset) => commentMutation.mutate(text, { onSuccess: () => reset && reset() })}
        />
      </Space>
    </Card>
  );
};

export default PostCard;
