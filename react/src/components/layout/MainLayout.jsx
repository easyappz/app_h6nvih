import React, { useMemo, useState } from 'react';
import { Layout, Menu, Avatar, Typography, Spin, Space, Button } from 'antd';
import { HomeOutlined, FireOutlined, UserOutlined, TeamOutlined, MessageOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { me as fetchMe } from '../../api/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const { data: meData, isLoading: meLoading, isError: meError } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5,
  });

  const selectedKey = useMemo(() => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/feed')) return '/feed';
    if (location.pathname.startsWith('/profile')) return '/profile';
    if (location.pathname.startsWith('/friends')) return '/friends';
    if (location.pathname.startsWith('/messages')) return '/messages';
    return '';
  }, [location.pathname]);

  const items = [
    { key: '/', icon: <HomeOutlined />, label: 'Главная', onClick: () => navigate('/') },
    { key: '/feed', icon: <FireOutlined />, label: 'Лента', onClick: () => navigate('/feed') },
    { key: '/profile', icon: <UserOutlined />, label: 'Профиль', onClick: () => navigate('/profile') },
    { key: '/friends', icon: <TeamOutlined />, label: 'Друзья', onClick: () => navigate('/friends') },
    { key: '/messages', icon: <MessageOutlined />, label: 'Сообщения', onClick: () => navigate('/messages') },
    { key: '/logout', icon: <LogoutOutlined />, danger: true, label: 'Выход', onClick: () => { localStorage.removeItem('token'); navigate('/login', { replace: true }); } },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(v) => setCollapsed(v)}>
        <div style={{ height: 56, margin: 12, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
          <Avatar size={collapsed ? 32 : 40} src={meData?.user?.avatarUrl} icon={<UserOutlined />} />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              {meLoading ? (
                <Text style={{ color: '#fff' }}>Загрузка...</Text>
              ) : meError ? (
                <Text style={{ color: '#fff' }}>Ошибка профиля</Text>
              ) : (
                <>
                  <Text style={{ color: '#fff', fontWeight: 600 }}>{meData?.user?.name || meData?.user?.username || 'Пользователь'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>в сети</Text>
                </>
              )}
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 600 }}>Easyappz Social</Text>
            <Space>
              {meLoading && <Spin size="small" />}
              {!meLoading && meData?.user && (
                <Space>
                  <Avatar size={28} src={meData.user.avatarUrl} icon={<UserOutlined />} />
                  <Text>{meData.user.name || meData.user.username}</Text>
                  <Button size="small" onClick={() => navigate('/profile')}>Профиль</Button>
                </Space>
              )}
            </Space>
          </div>
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ padding: 16, background: '#fff', borderRadius: 10, minHeight: 'calc(100vh - 160px)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
