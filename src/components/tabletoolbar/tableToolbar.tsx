import React from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import type { SxProps, Theme } from '@mui/material'; 

/* -------------------- Types -------------------- */
interface FilterOption {
  key: string;
  label: string;
  type: "text" | "select";
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  visible?: boolean;
  sx?: SxProps<Theme>;
  menuProps?: any;
  disabled?: boolean; // ✅ ADD THIS
}

interface ActionButton {
  label: string;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  variant?: "text" | "outlined" | "contained";
  startIcon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean; // ✅ Added disabled support
}

interface TableToolbarProps {
  filters?: FilterOption[];
  actions?: ActionButton[];
}

/* -------------------- Component -------------------- */
const TableToolbar: React.FC<TableToolbarProps> = ({
  filters = [],
  actions = [],
}) => {
  const visibleFilters = filters.filter((f) => f.visible !== false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mb: 2,
      }}
    >
      {/* -------------------- Filters -------------------- */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        {visibleFilters.map((filter) => (
          <Box key={filter.key}>
            {filter.type === "text" && (
              <TextField
                size="small"
                placeholder={filter.placeholder || filter.label}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 280 },
                  ...(filter.sx || {}),
                }}
              />
            )}

            {filter.type === "select" && (
              <FormControl
                size="small"
                sx={{
                  minWidth: 140,
                  ...(filter.sx || {}),
                }}
              >
                <Select
                  value={filter.value}
                  displayEmpty
                  onChange={(e) => filter.onChange(e.target.value)}
                  MenuProps={filter.menuProps}
                >
                  <MenuItem value="">
                    {filter.placeholder || filter.label}
                  </MenuItem>

                  {filter.options?.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        ))}
      </Box>

      {/* -------------------- Actions -------------------- */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          gap: 1.5,
        }}
      >
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant || "contained"}
            color={action.color || "primary"}
            size="small"
            startIcon={action.startIcon}
            onClick={action.onClick}
            disabled={action.disabled} // ✅ Works now
            sx={{
              width:
                action.label === "Sync"
                  ? { xs: "auto", sm: 90 }
                  : { xs: "100%", sm: "auto" },
              minWidth: action.label === "Sync" ? 90 : 70,
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default TableToolbar;
