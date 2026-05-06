import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Drawer,
  Tooltip,
  useTheme,
  Box,
} from '@mui/material';
import { ExpandLess, ExpandMore, } from '@mui/icons-material';
import logo2 from '/assets/logo2.png';
import sidebarlogo from '/assets/sidebar-logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { ICON_MAP, ADMIN_MENU_ITEMS, STUDENT_MENU_ITEMS, FACULTY_MENU_ITEMS } from '../../constants/MenuItems';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { getValue } from '../../utils/localStorageUtil';
import Customtext from '../inputs/customtext/Customtext';




interface SidebarProps {
  isDrawer?: boolean;
  open?: boolean;
  onClose?: () => void;
  isSidebarVisible?: boolean;
  setSidebarVisible?: (visible: boolean) => void;
}

export default function Sidebar({
  isDrawer = false,
  open = false,
  onClose,
  isSidebarVisible = true,
  setSidebarVisible,
}: SidebarProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [selectedParent, setSelectedParent] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme()
  const rollId = getValue("rollid")

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      setSelectedItem('Dashboard');
      setSelectedParent('');
      setOpenItems({});
    } else if (path.startsWith('/students/list')) {
      setSelectedItem('Students List');
      setSelectedParent('Students');
      setOpenItems((prev) => ({ ...prev, Students: true }));
    } else if (path.startsWith('/programs')) {
      setSelectedItem('Programs List');
      setSelectedParent('Programs');
      setOpenItems((prev) => ({ ...prev, Programs: true }));
    } else if (path.startsWith('/faculty')) {
      setSelectedItem('Faculty List');
      setSelectedParent('Faculty List');
      setOpenItems((prev) => ({ ...prev, Faculty: true }));
    }
    else if (path.startsWith('/syllabus')) {
      setSelectedItem('Syllabus List');
      setSelectedParent('Syllabus List');
      setOpenItems((prev) => ({ ...prev, Syllabus: true }));
    }
    else if (path.startsWith('/students/detail')) {
      setSelectedItem('Profile');
      setSelectedParent('');
      setOpenItems({});
    }
    else if (path.startsWith('/fees')) {
      setSelectedItem('Fees Detail');
      setSelectedParent('Fees');
      setOpenItems((prev) => ({ ...prev, Faculty: true }));
    }
    else if (path.startsWith('/grievances')) {
      setSelectedItem('Grievances');
      setSelectedParent('Grievances');
      setOpenItems((prev) => ({ ...prev, Faculty: true }));
    }
    else if (path.startsWith('/counselling')) {
      setSelectedItem('Student Counselling');
      setSelectedParent('');
      setOpenItems({});
    }
    else if (path.startsWith('/examinations')) {
      setSelectedItem('Examinations');
      setSelectedParent('');
      setOpenItems({});
    }
    else if (path.startsWith('/documents')) {
      setSelectedItem('Documents');
      setSelectedParent('');
      setOpenItems({});
    }
    else if (path.startsWith('/passwordmang')) {
      setSelectedItem('Password Management');
      setSelectedParent('');
      setOpenItems({});
    }

  }, [location.pathname]);

  // const handleSelect = (
  //   itemText: any,
  //   routePath: any,
  //   hasChildren: any,
  //   parentText = ''
  // ) => {
  //   if (routePath) {
  //     alert(itemText)
  //     navigate(routePath);
  //     setSelectedItem(itemText);
  //     setSelectedParent(parentText);

  //     if (parentText) {
  //       setOpenItems({ [parentText]: true }); // ✅ keep only parent open
  //     }

  //     if (isDrawer && onClose) {
  //       onClose();
  //     }
  //   } else if (hasChildren) {
  //     if (!isSidebarVisible) {
  //       setSidebarVisible?.(true);
  //     }

  //     setOpenItems((prev) => {
  //       const isCurrentlyOpen = prev[itemText];

  //       return isCurrentlyOpen ? {} : { [itemText]: true };
  //     });
  //   }
  // };

  const handleSelect = (
    itemText: any,
    routePath: any,
    hasChildren: any,
    parentText = ''
  ) => {
    if (routePath) {

      // ✅ Special case for Mentees
      if (itemText === "Mentees") {
        navigate(`${routePath}?urlname=Mentees`);
      } else {
        navigate(routePath);
      }

      setSelectedItem(itemText);
      setSelectedParent(parentText);

      if (parentText) {
        setOpenItems({ [parentText]: true });
      }

      if (isDrawer && onClose) {
        onClose();
      }

    } else if (hasChildren) {

      if (!isSidebarVisible) {
        setSidebarVisible?.(true);
      }

      setOpenItems((prev) => {
        const isCurrentlyOpen = prev[itemText];
        return isCurrentlyOpen ? {} : { [itemText]: true };
      });
    }
  };

  const registrationNo = getValue("username");

  const shouldShowExamResults = () => {
    if (!registrationNo) return false;

    // Extract numeric part after O0
    // Example: O0525001 -> 525001
    const numericPart = parseInt(registrationNo.replace("O0", ""), 10);

    const start = 525001; // O0525001
    const end = 525024;   // O0525024

    const isInRange = numericPart >= start && numericPart <= end;

    const isExcluded = registrationNo === "O0525003";

    return isInRange && !isExcluded;
  };

  const filteredMenuItems =
    rollId == "1"
      ? ADMIN_MENU_ITEMS :
      rollId == "2" ?
        STUDENT_MENU_ITEMS.filter((item) => {
          if (item.text === "Exam Results") {
            return shouldShowExamResults();
          }
          return true;
        }) :
        rollId == "3" ?
          FACULTY_MENU_ITEMS : [];


  const drawerContent = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      className={`bg-white border-r p-1 border-gray-200 transition-all duration-300 ${isSidebarVisible ? "w-64" : "w-16"
        }`}
    >

      <Box className={`text-center border-b border-gray-200 ${isSidebarVisible ? 'p-3 pb-2' : 'p-1 pb-3'}`}>
        {isSidebarVisible ? (
          <img src={logo2} alt="Logo" className="mx-auto object-contain h-12" />
        ) : (
          <img src={sidebarlogo} alt="Logo Small" className="mx-auto object-contain h-12" />
        )}
      </Box>

      <List
        component="nav"
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 3,
        }}
      >

        {(filteredMenuItems).map((item) => {
          const hasChildren = item.subItems.length > 0;
          const isOpen = openItems[item.text] || false;
          const isActive = selectedItem === item.text || selectedParent === item.text;

          return (
            <Box key={item.text}>
              {!isSidebarVisible ? (
                <Tooltip title={item.text} placement="right" arrow>
                  <ListItem
                    component={Box}
                    onClick={() => handleSelect(item.text, item.routePath, hasChildren)}
                    sx={{
                      bgcolor: isActive ? theme.palette.secondary.main : 'transparent',
                      color: isActive ? 'white' : theme.palette.secondary.main,
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingLeft: 0,
                      paddingRight: 0,
                      height: '48px',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                      },
                      '&:hover .MuiListItemIcon-root': { color: 'white' },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        color: isActive ? 'white' : theme.palette.secondary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {ICON_MAP[item.icon]}
                    </ListItemIcon>
                  </ListItem>
                </Tooltip>
              ) : (
                <ListItem
                  component={Box}
                  onClick={() => handleSelect(item.text, item.routePath, hasChildren)}
                  sx={{
                    bgcolor: isActive ? theme.palette.secondary.main : 'transparent',
                    color: isActive ? 'white' : theme.palette.secondary.main,
                    fontSize: '1rem',
                    fontWeight: 500,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    height: '48px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                    },
                    '&:hover .MuiListItemIcon-root': { color: 'white' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: isActive ? 'white' : theme.palette.secondary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {ICON_MAP[item.icon]}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.text}
                    sx={{ pl: 2, opacity: 1 }}
                  />

                  {hasChildren && (
                    <Box style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      {isOpen ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItem>
              )}

              {hasChildren && (
                <Collapse in={isOpen && isSidebarVisible} timeout="auto" unmountOnExit>
                  <List component={Box} disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        component={Box}
                        onClick={() =>
                          handleSelect(subItem.text, subItem.routePath, false, item.text)
                        }
                        sx={{
                          fontSize: '0.875rem',
                          color:
                            selectedItem === subItem.text
                              ? theme.palette.secondary.main
                              : theme.palette.text.primary,
                          justifyContent: 'flex-start',  // Align content left
                          cursor: 'pointer',
                          pl: 4,
                          '&:hover': {
                            backgroundColor: theme.palette.custom.highlight,
                            color: theme.palette.text.primary,
                            borderRadius: '8px',
                          },
                        }}
                      >
                        {/* Minus Icon */}
                        <RadioButtonUncheckedIcon
                          fontSize="small"
                          sx={{
                            mr: 1,
                            fontSize: '0.5rem',
                            color: selectedItem === subItem.text
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.text.primary,
                            },
                          }}
                        />


                        <ListItemText
                          primary={subItem.text}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: selectedItem === subItem.text ? 'bold' : 'normal',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>

          );
        })}
      </List>

      <Box className="text-left ml-5 border-t border-gray-200 p-2">
        <Customtext
          fieldName={'version 1.0.0'}
          variantName="caption"
          sx={{ color: theme.palette.warning.main }}
        />
      </Box>
    </Box>
  );

  if (isDrawer) {
    return (
      <Drawer anchor="left" open={open} onClose={onClose}>
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <>
      {drawerContent}
    </>
  );
}
