import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Space, Avatar, List, Empty, Spin, Button, Upload, Modal, Form, Input, message } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { me as fetchMe } from '../api/auth';
import { getUser, updateUser } from '../api/users';
import { getUserPosts } from '../api/posts';
import { uploadImage } from '../api/upload';
import { sendRequest, acceptRequest, removeFriend } from '../api/friends';
import PostCard from '../components/posts/PostCard';

const { Title, Text } = Typography;

const Profile = () => {
  const params = useParams();
  const routeId = params.id || null;
  const qc = useQueryClient();

  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const me = meQuery.data?.user;
  const effectiveUserId = routeId || me?._id || null;

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

  const isOwn = useMemo(() => me?._id && effectiveUserId && me._id === effectiveUserId, [me, effectiveUserId]);

  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const friendStatus = useMemo(() => {
    if (!me || !userQuery.data?.user || isOwn) return 'self';
    const targetId = userQuery.data.user._id;
    const friends = me.friends || [];
    const incoming = me.friendRequests?.in || [];
    const outgoing = me.friendRequests?.out || [];
    if (friends.includes(targetId)) return 'friends';
    if (incoming.includes(targetId)) return 'incoming';
    if (outgoing.includes(targetId)) return 'outgoing';
    return 'none';
  }, [me, userQuery.data, isOwn]);

  const sendReqMutation = useMutation({
    mutationFn: (id) => sendRequest(id),
    onSuccess: () => {
      message.success('Заявка отправлена');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => message.error('Не удалось отправить заявку'),
  });

  const acceptReqMutation = useMutation({
    mutationFn: (id) => acceptRequest(id),
    onSuccess: () => {
      message.success('Заявка принята');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => message.error('Не удалось принять заявку'),
  });

  const removeFriendMutation = useMutation({
    mutationFn: (id) => removeFriend(id),
    onSuccess: () => {
      message.success('Удалено из друзей');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => message.error('Не удалось удалить из друзей'),
  });

  const openEdit = () => {
    const u = userQuery.data?.user;
    form.setFieldsValue({
      name: u?.name || '',
      username: u?.username || '',
      bio: u?.bio || '',
      avatarUrl: u?.avatarUrl || '',
      coverUrl: u?.coverUrl || '',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      await updateUser(effectiveUserId, values);
      message.success('Профиль обновлён');
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ['user', effectiveUserId] });
      if (isOwn) qc.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      if (e?.errorFields) return; // validation error in form
      message.error('Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadToField = async (field, file, onSuccess, onError) => {
    try {
      const res = await uploadImage(file);
      if (res?.url) {
        const prev = form.getFieldValue(field);
        form.setFieldValue(field, res.url);
        onSuccess && onSuccess(res);
        message.success('Изображение обновлено');
      } else {
        throw new Error('no-url');
      }
    } catch (e) {
      message.error('Загрузка не удалась');
      onError && onError(e);
    }
  };

  if (!effectiveUserId) return <Spin />;

  const user = userQuery.data?.user;
  const posts = postsQuery.data?.posts || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card bodyStyle={{ padding: 0 }}>
        <div style={{ position: 'relative', height: 200, background: '#F5F5F5', borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden' }}>
          {user?.coverUrl && (
            <img src={user.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <div style={{ position: 'relative' }}>
              <Avatar size={96} src={user?.avatarUrl} icon={<UserOutlined />} style={{ border: '3px solid #fff', marginTop: -64, background: '#fff' }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>{user?.name || user?.username}</Title>
              <Text type="secondary">@{user?.username}</Text>
              {user?.bio && <div style={{ marginTop: 8 }}><Text>{user.bio}</Text></div>}
            </div>
          </Space>
          <Space>
            {isOwn ? (
              <Button type="primary" onClick={openEdit}>Редактировать профиль</Button>
            ) : friendStatus === 'friends' ? (
              <Button danger loading={removeFriendMutation.isLoading} onClick={() => removeFriendMutation.mutate(user._id)}>Удалить из друзей</Button>
            ) : friendStatus === 'incoming' ? (
              <Button type="primary" loading={acceptReqMutation.isLoading} onClick={() => acceptReqMutation.mutate(user._id)}>Принять заявку</Button>
            ) : friendStatus === 'outgoing' ? (
              <Button disabled>Заявка отправлена</Button>
            ) : (
              <Button type="primary" loading={sendReqMutation.isLoading} onClick={() => sendReqMutation.mutate(user._id)}>Добавить в друзья</Button>
            )}
          </Space>
        </div>
      </Card>

      <Card title="Публикации">
        <List
          dataSource={posts}
          locale={{ emptyText: <Empty description="Пока нет публикаций" /> }}
          renderItem={(post) => (
            <List.Item key={post._id}>
              <PostCard post={post} onChanged={() => qc.invalidateQueries({ queryKey: ['user-posts', effectiveUserId] })} />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Редактирование профиля"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Имя" name="name">
            <Input placeholder="Ваше имя" />
          </Form.Item>
          <Form.Item label="Имя пользователя" name="username">
            <Input placeholder="username" />
          </Form.Item>
          <Form.Item label="О себе" name="bio">
            <Input.TextArea placeholder="Коротко о себе" autoSize={{ minRows: 2, maxRows: 6 }} />
          </Form.Item>
          <Form.Item label="Аватар" name="avatarUrl">
            <Space>
              <Input placeholder="URL аватара" style={{ width: 280 }} />
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={({ file, onSuccess, onError }) => handleUploadToField('avatarUrl', file, onSuccess, onError)}
              >
                <Button icon={<CameraOutlined />}>Загрузить</Button>
              </Upload>
            </Space>
          </Form.Item>
          <Form.Item label="Обложка" name="coverUrl">
            <Space>
              <Input placeholder="URL обложки" style={{ width: 280 }} />
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={({ file, onSuccess, onError }) => handleUploadToField('coverUrl', file, onSuccess, onError)}
              >
                <Button icon={<CameraOutlined />}>Загрузить</Button>
              </Upload>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default Profile;
