import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import CardComponent from "../../../../components/card/Card";

import apiClient from "../../../../services/ApiClient";
import { ApiRoutes } from "../../../../constants/ApiConstants";

import { useAlert } from "../../../../context/AlertContext";
import { useGlobalError } from "../../../../context/ErrorContext";

import { apiRequest } from "../../../../utils/ApiRequest";
import CustomSelect from "../../../../components/inputs/customtext/CustomSelect";
import CustomInputText from "../../../../components/inputs/customtext/CustomInputText";

export default function FeeComponentAdd() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const { showAlert } = useAlert();
  const { clearError } = useGlobalError();

  const [feeDetails, setFeeDetails] = React.useState<any[]>([]);

  const [feeDetailId, setFeeDetailId] = React.useState("");
  const [feeHeadId, setFeeHeadId] = React.useState("");
  const [amount, setAmount] = React.useState("");

  /* ---------------------------- FEE HEAD OPTIONS ---------------------------- */

  const feeHeadOptions = [
    {
      label: "Application Fee",
      value: "1",
    },
    {
      label: "Admission Fee",
      value: "2",
    },
    {
      label: "Tuition Fee",
      value: "3",
    },
    {
      label: "LMS Fee",
      value: "4",
    },
    {
      label: "Exam Fee",
      value: "5",
    },
    {
      label: "Lab Fee",
      value: "6",
    },
  ];

  /* ---------------------------- GET FEE DETAILS ---------------------------- */

  const fetchFeeDetails = async () => {
    try {
      const res = await apiClient.get(
        ApiRoutes.FEEDETAILGETALL
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setFeeDetails(data);
    } catch (error) {
      console.error(
        "Failed to load fee details:",
        error
      );

      setFeeDetails([]);

      showAlert(
        "Failed to load fee details",
        "error"
      );
    }
  };

  /* ---------------------------- GET COMPONENT BY ID ---------------------------- */

  const fetchComponent = async () => {
    if (!id) {
      return;
    }

    try {
      const res = await apiClient.get(
        `${ApiRoutes.FEECOMPONENTGETBYID}/${id}`
      );

      const data = res.data?.data || res.data;

      setFeeDetailId(
        String(data?.fee_detail_id ?? "")
      );

      setFeeHeadId(
        String(data?.fee_head_id ?? "")
      );

      setAmount(
        String(data?.amount ?? "")
      );
    } catch (error: any) {
      console.error(
        "Failed to load fee component:",
        error
      );

      showAlert(
        error?.response?.data?.detail ||
          "Failed to load fee component",
        "error"
      );
    }
  };

  /* ---------------------------- INITIAL LOAD ---------------------------- */

  React.useEffect(() => {
    clearError();

    fetchFeeDetails();

    if (isEdit) {
      fetchComponent();
    }
  }, [id]);

  /* ---------------------------- FEE DETAIL OPTIONS ---------------------------- */

  const feeDetailOptions = React.useMemo(() => {
    return feeDetails.map((fee) => ({
      label: `${fee.semester || ""}${
        fee.programe_id
          ? ` - Program ${fee.programe_id}`
          : ""
      }`,
      value: String(fee.id),
    }));
  }, [feeDetails]);

  /* ---------------------------- SUBMIT ---------------------------- */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    /* ---------- VALIDATION ---------- */

    if (!feeDetailId) {
      showAlert(
        "Please select fee detail",
        "error"
      );
      return;
    }

    if (!feeHeadId) {
      showAlert(
        "Please select fee head",
        "error"
      );
      return;
    }

    if (
      amount.trim() === "" ||
      Number(amount) < 0
    ) {
      showAlert(
        "Please enter a valid amount",
        "error"
      );
      return;
    }

    /* ---------- PAYLOAD ---------- */

    const payload = {
      fee_detail_id: Number(feeDetailId),
      fee_head_id: Number(feeHeadId),
      amount: String(amount),
    };

    try {
      /* ---------- UPDATE ---------- */

      if (isEdit) {
        await apiRequest({
          url: `${ApiRoutes.FEECOMPONENTUPDATE}/${id}`,
          method: "put",
          data: payload,
        });

        showAlert(
          "Fee component updated successfully!",
          "success"
        );
      }

      /* ---------- CREATE ---------- */

      else {
        await apiRequest({
          url: ApiRoutes.FEECOMPONENTCREATE,
          method: "post",
          data: payload,
        });

        showAlert(
          "Fee component created successfully!",
          "success"
        );
      }

      navigate("/fee-component/list");
    } catch (error: any) {
      console.error(
        "Fee component save error:",
        error
      );

      showAlert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          `Failed to ${
            isEdit
              ? "update"
              : "create"
          } fee component.`,
        "error"
      );
    }
  };

  /* ------------------------------- UI ------------------------------- */

  return (
    <CardComponent
      sx={{
        width: "100%",
        maxWidth: {
          xs: "350px",
          sm: "700px",
          md: "900px",
        },
        mx: "auto",
        p: 3,
        mt: 3,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >
          {/* ---------------- FEE DETAIL ---------------- */}

          <CustomSelect
            label="Fee Detail"
            field={{
              value: feeDetailId,
              onChange: (
                value: string
              ) => {
                setFeeDetailId(value);
              },
            }}
            options={feeDetailOptions}
          />

          {/* ---------------- FEE HEAD ---------------- */}

          <CustomSelect
            label="Fee Head"
            field={{
              value: feeHeadId,
              onChange: (
                value: string
              ) => {
                setFeeHeadId(value);
              },
            }}
            options={feeHeadOptions}
          />

          {/* ---------------- AMOUNT ---------------- */}

          <CustomInputText
            label="Amount"
            field={{
              value: amount,
              onChange: (
                value: string
              ) => {
                if (
                  value === "" ||
                  /^\d*\.?\d*$/.test(
                    value
                  )
                ) {
                  setAmount(value);
                }
              },
            }}
          />
        </div>

        {/* ---------------- BUTTONS ---------------- */}

        <div
          className="
            flex
            justify-end
            gap-3
            mt-6
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/fee-component/list"
              )
            }
            className="
              px-5
              py-2
              rounded
              border
              border-gray-300
              text-gray-700
              hover:bg-gray-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            className="
              px-5
              py-2
              rounded
              bg-[#105c8e]
              text-white
              hover:opacity-90
            "
          >
            {isEdit
              ? "Update"
              : "Save"}
          </button>
        </div>
      </form>
    </CardComponent>
  );
}