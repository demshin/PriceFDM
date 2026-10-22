import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import SpoolIcon from '@mui/icons-material/Cable';
import PrintIcon from '@mui/icons-material/Print';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useTranslation } from '../../i18n/useTranslation';

export type AppTab = 'calculator' | 'warehouse' | 'spools' | 'printers' | 'history' | 'profit' | 'settings';

// Tabs are built dynamically inside the component via translations

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  colorMode: 'light' | 'dark';
  onToggleColorMode: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({
  activeTab,
  onTabChange,
  colorMode,
  onToggleColorMode,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation();

  const TABS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'calculator', label: t.nav_calculator, icon: <CalculateIcon /> },
    { id: 'warehouse', label: t.nav_warehouse, icon: <WarehouseIcon /> },
    { id: 'spools', label: t.nav_spools, icon: <SpoolIcon /> },
    { id: 'printers', label: t.nav_printers, icon: <PrintIcon /> },
    { id: 'history', label: t.nav_history, icon: <HistoryIcon /> },
    { id: 'profit', label: t.nav_profit, icon: <TrendingUpIcon /> },
    { id: 'settings', label: t.nav_settings, icon: <SettingsIcon /> },
  ];

  const handleTabChange = (tab: AppTab) => {
    onTabChange(tab);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          pt: 'var(--sat, 0px)', // safe area для статус-бара
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}

          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 0 }}>
            <CalculateIcon color="primary" />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              PriceFDM
            </Typography>
          </Stack>

          {!isMobile && (
            <Tabs
              value={activeTab}
              onChange={(_, v) => handleTabChange(v)}
              sx={{ ml: 3, flex: 1 }}
              TabIndicatorProps={{ style: { height: 3, borderRadius: 2 } }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  value={tab.id}
                  label={tab.label}
                  icon={tab.icon as React.ReactElement}
                  iconPosition="start"
                  sx={{ minHeight: 56 }}
                />
              ))}
            </Tabs>
          )}

          <Box sx={{ flex: isMobile ? 1 : 0 }} />

          <Tooltip title={colorMode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
            <IconButton onClick={onToggleColorMode}>
              {colorMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer — свайп слева направо открывает */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: { sx: { pt: 'var(--sat, 0px)' } },
        }}
      >
        <Box sx={{ width: 240, pt: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>PriceFDM</Typography>
          </Stack>
          <List>
            {TABS.map((tab) => (
              <ListItem key={tab.id} disablePadding>
                <ListItemButton
                  selected={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <ListItemIcon>{tab.icon}</ListItemIcon>
                  <ListItemText primary={tab.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, md: 3 }, pb: { xs: 'calc(16px + var(--sab, 0px))', md: 3 }, flex: 1 }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
