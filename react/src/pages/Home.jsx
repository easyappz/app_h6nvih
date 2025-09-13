import React from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Title level={2}>Добро пожаловать!</Title>
      <Paragraph>
        Это стартовая страница вашего приложения. Перейдите в ленту, чтобы посмотреть публикации друзей.
      </Paragraph>
      <Button type="primary" onClick={() => navigate('/feed')}>Перейти в ленту</Button>
    </div>
  );
};

export default Home;
