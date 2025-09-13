import React, { useMemo, useState } from 'react';
import { Card, Form, Input, Upload, Button, Space, Image, message } from 'antd';
import { PictureOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadImage } from '../../api/upload';
import { createPost } from '../../api/posts';

const { TextArea } = Input;

const CreatePost = ({ onCreated }) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]); // array of urls
  const [uploading, setUploading] = useState(false);

  const fileList = useMemo(
    () => images.map((url, idx) => ({ uid: `${idx}`, name: url.split('/').pop() || `image-${idx+1}.jpg`, status: 'done', url })),
    [images]
  );

  const createMutation = useMutation({
    mutationFn: () => createPost({ text, images }),
    onSuccess: () => {
      message.success('Публикация создана');
      setText('');
      setImages([]);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (onCreated) onCreated();
    },
    onError: () => message.error('Не удалось создать публикацию'),
  });

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const res = await uploadImage(file);
      if (res?.url) {
        setImages((prev) => [...prev, res.url]);
        onSuccess && onSuccess(res, file);
        message.success('Изображение загружено');
      } else {
        throw new Error('no-url');
      }
    } catch (e) {
      message.error('Загрузка изображения не удалась');
      onError && onError(e);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (file) => {
    const url = file.url;
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const canPost = text.trim().length > 0 || images.length > 0;

  return (
    <Card title="Создать публикацию" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <TextArea
          value={text}
          placeholder="О чём вы думаете?"
          autoSize={{ minRows: 2, maxRows: 6 }}
          onChange={(e) => setText(e.target.value)}
        />
        {images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {images.map((url) => (
              <Image key={url} src={url} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        )}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Upload
            multiple
            accept="image/*"
            customRequest={handleCustomUpload}
            showUploadList={false}
            disabled={uploading}
          >
            <Button icon={<PictureOutlined />} disabled={uploading}>Добавить фото</Button>
          </Upload>
          <Button type="primary" icon={<SendOutlined />} onClick={() => createMutation.mutate()} loading={createMutation.isLoading} disabled={!canPost}>
            Опубликовать
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default CreatePost;
