import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Страница не найдена"
      extra={<Button type="primary" onClick={() => navigate('/')}>На главную</Button>}
    />
  );
};

export default NotFound;
