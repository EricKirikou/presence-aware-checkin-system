// src/components/DashboardHeader.tsx
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as ProfileIcon
} from "@mui/icons-material";
import { useAuth } from "./AuthContext";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        <Box sx={{ flexGrow: 1 }}>
          {title && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography 
              variant="subtitle2" 
              sx={{
                color: (theme) => theme.palette.text.secondary,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <IconButton 
          onClick={handleMenuOpen}
          sx={{
            p: 0.5,
            border: (theme) => `2px solid ${theme.palette.primary.light}`,
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s',
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: (theme) => theme.palette.primary.main,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
        
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              overflow: 'visible',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              }
            }
          }}
        >
          <MenuItem onClick={handleViewProfile}>
            <ListItemIcon>
              <ProfileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Profile</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: 'error' }}>
              Logout
            </ListItemText>
          </MenuItem>
        </Menu>
        
        <Dialog 
          open={confirmOpen} 
          onClose={() => setConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 1,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Confirm Logout
          </DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to logout?</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmLogout} 
              color="error" 
              variant="contained"
              sx={{ borderRadius: 2 }}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;