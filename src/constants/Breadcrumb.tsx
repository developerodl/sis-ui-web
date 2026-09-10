import { Box, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { routesConfig } from "./Routeconfig";
import theme from "../styles/theme";
import { getValue } from "../utils/localStorageUtil";

// Generate route map
const generateRouteMap = (routes: any[], parentPath = ''): Record<string, string> => {
  let map: Record<string, string> = {};
  routes.forEach(route => {
    const fullPath = `${parentPath}${route.path}`.replace(/\/+/g, '/');
    if (route.breadcrumb) map[fullPath] = route.breadcrumb;
    if (route.children) {
      map = { ...map, ...generateRouteMap(route.children, fullPath.endsWith('/') ? fullPath : fullPath + '/') };
    }
  });
  return map;
};

const routeMap = generateRouteMap(routesConfig);

const Breadcrumb = () => {
  const rollid = Number(getValue("rollid"));
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const breadcrumbPaths: string[] = [];

  pathnames.forEach((_, idx) => {
    const path = `/${pathnames.slice(0, idx + 1).join('/')}`;
    const matchedRoute = Object.keys(routeMap).find(routeKey => {
      const pattern = routeKey.replace(/:\w+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    });
    if (matchedRoute) breadcrumbPaths.push(matchedRoute);
  });

  // Conditionally include '/dashboard' based on rollid
  const allPaths = rollid === 1 ? ['/dashboard', ...breadcrumbPaths] : breadcrumbPaths;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, p: 2
    }}>
      {allPaths.map((to, index) => {
        // const text = routeMap[to] || 'Dashboard';
        // const text = routeMap[to] || '';
        const text =
          to === '/marks/add' && (rollid === 5 || rollid === 6 || rollid === 7)
            ? 'Students Mark'
            : routeMap[to] || '';
        const isLast = index === allPaths.length - 1;

        return (
          <Box key={to} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Typography
              component={isLast ? 'span' : RouterLink}
              to={isLast ? undefined : to}
              sx={{
                fontWeight: isLast ? 'bold' : 500,
                color: isLast ? theme.palette.secondary.main : '#555',
                fontSize: 14,
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  color: !isLast ? theme.palette.secondary.main : undefined,
                  transform: !isLast ? 'scale(1.05)' : undefined,
                },
              }}
            >
              {text}
            </Typography>
            {!isLast && (
              <NavigateNextIcon
                fontSize="small"
                sx={{ color: '#999', transition: 'color 0.2s' }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default Breadcrumb;
