import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import io from 'socket.io-client';

const OrderContext = createContext();
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://move-x-backend.onrender.com';

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PICKED_UP: 'PICKED_UP',
  NAVIGATING: 'NAVIGATING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('movex_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // Socket Connection
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('maintenance_status', (data) => {
      setIsMaintenance(data.enabled);
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setActiveOrder(prev => prev?._id === updatedOrder._id ? updatedOrder : prev);
    });

    socket.on('new_order', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('driver_location_updated', (data) => {
      setUsers(prev => prev.map(u => u._id === data.driverId ? { ...u, lat: data.lat, lng: data.lng, isOnline: true } : u));
    });

    return () => socket.disconnect();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    let currentRole = null;
    try {
      // 1. Check System Status (Infrastructure Guard)
      const sysRes = await api.get('/system/status').catch(() => ({ data: { maintenanceMode: false } }));
      setIsMaintenance(sysRes.data.maintenanceMode);

      const token = localStorage.getItem('movex_token');
      if (token) {
        const meRes = await api.get('/auth/me').catch(() => ({ data: {} }));
          const userData = meRes.data?.user || meRes.data || null;
          // Guard: if userData is null or has no role, clear stale session
          if (!userData || !userData.role) {
            console.warn('[IDENTITY] No valid user data from /auth/me. Clearing session.');
            localStorage.removeItem('movex_token');
            setCurrentUser(null);
            setIsAuthenticated(false);
          } else if (userData.role !== 'admin' && userData.role !== 'partner') {
            console.warn('[IDENTITY MISMATCH] Unauthorized role detected on Secure Portal. Purging session.');
            localStorage.removeItem('movex_token');
            setCurrentUser(null);
            setIsAuthenticated(false);
          } else {
            setCurrentUser(userData);
            currentRole = userData.role;
            setIsAuthenticated(true);
          }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }

      if (token && currentRole) {
          // Fetch orders, users, and financial data concurrently
          const [ordersRes, usersRes] = await Promise.all([
            api.get('/orders/available').catch(() => ({ data: { orders: [] } })),
            currentRole === 'admin' 
              ? api.get('/auth/users').catch(() => ({ data: { users: [] } }))
              : Promise.resolve({ data: { users: [] } })
          ]);
          setOrders(ordersRes.data.orders || []);
          setUsers(usersRes.data.users || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const refreshData = () => fetchInitialData();

  const loginUser = async (phone, password, role = 'admin') => {
    try {
      const res = await api.post('/auth/login', {
        phone,
        password,
        role,
        name: role === 'admin' ? 'Admin User' : `User_${String(phone).slice(-4)}`
      });
      if (res.data.success) {
        // RADAR CHECK: Dashboard is for High-Level Clearance ONLY
        if (res.data.user.role !== 'admin' && res.data.user.role !== 'partner') {
          console.error('[SECURITY BREACH] Unauthorized role attempted on Control Center.');
          return { message: 'Clearance Denied: Your role lacks authorization for the Control Center.' };
        }
        
        localStorage.setItem('movex_token', res.data.token);
        setCurrentUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (e) {
      // Return the backend error message so UI can show it
      const msg = e.response?.data?.message || 'Login failed. Please try again.';
      console.error('Login error:', msg);
      return { message: msg };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('movex_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const createOrder = async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      const newOrder = response.data.order;
      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, driverInfo = null) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        ...(driverInfo && { driverId: currentUser?._id || driverInfo.id })
      });
      const updatedOrder = response.data.order;
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      if (activeOrder?._id === orderId) setActiveOrder(updatedOrder);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const cancelOrder = async (id) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      const updated = response.data.order;
      setOrders(prev => prev.map(o => o._id === id ? updated : o));
      if (activeOrder?._id === id) setActiveOrder(updated);
    } catch (error) {
      console.error('Cancellation failure:', error);
      alert('Mission retraction failed. Handshake error.');
    }
  };

  const switchRole = (role) => {
    console.log(`[MoveX] Switching interface protocol to: ${role.toUpperCase()}`);
    setCurrentUser(prev => prev ? { ...prev, role } : { role });
  };

  return (
    <OrderContext.Provider value={{
      orders,
      users,
      activeOrder,
      setActiveOrder,
      currentUser,
      isAuthenticated,
      loginUser,
      logoutUser,
      createOrder,
      updateOrderStatus,
      cancelOrder,
      switchRole,
      refreshData,
      isMaintenance,
      loading
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
