import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiRegister(values);
      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/feed', { replace: true });
      } else {
        setError('Неизвестный ответ сервера');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 420 }}>
        <Title level={3} style={{ textAlign: 'center' }}>Регистрация</Title>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />} 
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Имя пользователя" name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}> 
            <Input placeholder="username" />
          </Form.Item>
          <Form.Item label="Имя" name="name"> 
            <Input placeholder="Ваше имя" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Создать аккаунт</Button>
        </Form>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
