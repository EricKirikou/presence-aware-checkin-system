import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CheckCircle,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useColorMode } from '../contexts/ColorModeContext';

const expandedWidth = 240;
const collapsedWidth = 70;

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const toggleDrawer = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
              {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
            </IconButton>
            {!collapsed && (
              <Typography variant="h6" noWrap>
                Presence Aware Check-in System
              </Typography>
            )}
          </Box>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Collapsible Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? collapsedWidth : expandedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? collapsedWidth : expandedWidth,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to="/dashboard"
              selected={location.pathname === '/dashboard'}
              sx={{ minHeight: 48, justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
                <DashboardIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Dashboard" />}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to="/check-in"
              selected={location.pathname === '/check-in'}
              sx={{ minHeight: 48, justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
                <CheckCircle />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Check In" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: 8,
          transition: 'margin-left 0.3s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout;
