import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { IconSearch, IconBan, IconTrash } from "@tabler/icons-react";
import { useGetAccountsQuery, useDeleteAccountMutation, useLoginMutation, useToggleAccountStatusMutation } from "../../api/dengueApi";
import { useSelector } from "react-redux";
import { toastSuccess, toastError } from "../../utils.jsx";

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  filter: true,
};

const customTheme = themeQuartz.withParams({
  borderRadius: 10,
  columnBorder: false,
  fontFamily: "inherit",
  headerFontSize: 14,
  headerFontWeight: 700,
  headerRowBorder: false,
  headerVerticalPaddingScale: 1.1,
  headerTextColor: "var(--color-base-content)",
  spacing: 11,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
});

const DateCell = ({ value }) => {
  const date = new Date(value);
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <span>{formatted}</span>;
};

const StatusCell = ({ value }) => {
  let bgColor = "";
  let textColor = "";

  switch (value) {
    case "disabled":
      bgColor = "bg-error";
      textColor = "text-white";
      break;
    case "active":
      bgColor = "bg-success";
      textColor = "text-white";
      break;
    case "unverified":
      bgColor = "bg-warning";
      textColor = "text-white";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-600";
  }

  return (
    <div className="h-full flex justify-center items-center">
      <span
        className={`px-3.5 py-1 capitalize rounded-full text-sm font-medium ${bgColor} ${textColor}`}
      >
        {value}
      </span>
    </div>
  );
};

const RoleCell = ({ value }) => {
  let bgColor = "";
  let textColor = "";

  switch (value.toLowerCase()) {
    case "superadmin":
      bgColor = "bg-purple-600";
      textColor = "text-white";
      break;
    case "admin":
      bgColor = "bg-blue-600";
      textColor = "text-white";
      break;
    default:
      bgColor = "bg-gray-500";
      textColor = "text-white";
  }

  return (
    <div className="h-full flex justify-center items-center">
      <span
        className={`px-3.5 py-1 capitalize rounded-full text-sm font-medium ${bgColor} ${textColor}`}
      >
        {value}
      </span>
    </div>
  );
};

function AdminsTable({ statusFilter, roleFilter, searchQuery }) {
  const { data: accounts, isLoading, error, refetch } = useGetAccountsQuery();
  const gridRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDisabling, setIsDisabling] = useState(true);

  const [deleteAccount] = useDeleteAccountMutation();
  const [login] = useLoginMutation();
  const [toggleStatus] = useToggleAccountStatusMutation();
  const superAdminEmail = useSelector((state) => state.auth?.user?.email);

  const handleDeleteClick = (accountId) => {
    setSelectedAccountId(accountId);
    setShowDeleteModal(true);
  };

  const verifySuperAdmin = async () => {
    try {
      const loginData = {
        email: superAdminEmail,
        password: superAdminPassword,
        role: "superadmin"
      };

      const response = await login(loginData).unwrap();
      return true;
    } catch (error) {
      setAuthError("Incorrect super admin password.");
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!superAdminPassword.trim()) {
      setAuthError("Please enter your password");
      return;
    }

    setIsSubmitting(true);
    try {
      const isVerified = await verifySuperAdmin();
      if (!isVerified) {
        setIsSubmitting(false);
        return;
      }

      await deleteAccount(selectedAccountId).unwrap();
      toastSuccess("Account deleted successfully");
      setShowDeleteModal(false);
      setSuperAdminPassword("");
      setAuthError("");
      await refetch();
    } catch (error) {
      toastError(error?.data?.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowDeleteModal(false);
    setSelectedAccountId(null);
    setSuperAdminPassword("");
    setAuthError("");
    setIsSubmitting(false);
  };

  const handleStatusClick = (account) => {
    setSelectedAccount(account);
    setIsDisabling(account.status !== "disabled");
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!superAdminPassword.trim()) {
      setAuthError("Please enter your password");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Starting status toggle process for account:', selectedAccount);
      
      const isVerified = await verifySuperAdmin();
      console.log('Super admin verification result:', isVerified);
      
      if (!isVerified) {
        setIsSubmitting(false);
        return;
      }

      const newStatus = isDisabling ? "disabled" : "active";
      console.log('Sending toggle status request:', {
        id: selectedAccount._id,
        status: newStatus
      });

      const response = await toggleStatus({
        id: selectedAccount._id,
        status: newStatus
      }).unwrap();

      console.log('Toggle status API response:', response);

      // Force immediate refetch
      await refetch();
      
      // Update local state
      const updatedAccounts = accounts?.map(account => 
        account._id === selectedAccount._id 
          ? { ...account, status: newStatus }
          : account
      );

      toastSuccess(`Account ${isDisabling ? 'disabled' : 'enabled'} successfully`);
      setShowStatusModal(false);
      setSuperAdminPassword("");
      setAuthError("");
      
    } catch (error) {
      console.error('Error in handleStatusConfirm:', {
        error,
        errorMessage: error?.data?.message,
        errorStatus: error?.status,
        errorData: error?.data
      });
      toastError(error?.data?.message || `Failed to ${isDisabling ? 'disable' : 'enable'} account`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusModalClose = () => {
    setShowStatusModal(false);
    setSelectedAccount(null);
    setSuperAdminPassword("");
    setAuthError("");
    setIsSubmitting(false);
  };

  const ActionsCell = (p) => {
    // Check if the account is a super admin
    const isSuperAdmin = p.data.role.toLowerCase() === "superadmin";

    return (
      <div className="py-2 h-full w-full flex items-center gap-2">
        <button className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md">
          <IconSearch size={13} stroke={2.5} />
          <p className="text-sm">view</p>
        </button>
        {/* Only show disable/enable button if not super admin */}
        {!isSuperAdmin && (
          <button 
            onClick={() => handleStatusClick(p.data)}
            className="flex items-center gap-1 text-warning hover:bg-gray-200 p-1 rounded-md"
          >
            <IconBan size={15} stroke={2} />
            <p className="text-sm">{p.data.status === "disabled" ? "enable" : "disable"}</p>
          </button>
        )}
        {/* Only show remove button if not super admin */}
        {!isSuperAdmin && (
          <button 
            onClick={() => handleDeleteClick(p.data._id)}
            className="flex items-center gap-1 text-error hover:bg-gray-200 p-1 rounded-md"
          >
            <IconTrash size={15} stroke={2.5} />
            <p className="text-sm">remove</p>
          </button>
        )}
      </div>
    );
  };

  // Update the rowData transformation to remove date filtering
  const rowData = useMemo(() => {
    if (!accounts) return [];
    
    return accounts
      .filter(account => {
        // First filter by role (admin/superadmin) and not deleted
        const roleMatch = account.role === 'admin' || account.role === 'superadmin';
        const isNotDeleted = account.status !== 'deleted';
        
        // Then apply status filter if it exists
        const statusMatch = !statusFilter || 
          (statusFilter === 'active' && account.status === 'active') ||
          (statusFilter === 'disabled' && account.status === 'disabled') ||
          (statusFilter === 'unverified' && !account.verified);
        
        // Then apply role filter if it exists
        const roleTypeMatch = !roleFilter || account.role === roleFilter;

        // Add search filter
        const searchMatch = !searchQuery || 
          account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account.email.toLowerCase().includes(searchQuery.toLowerCase());

        return roleMatch && isNotDeleted && statusMatch && roleTypeMatch && searchMatch;
      })
      .map(account => ({
        _id: account._id,
        username: account.username,
        email: account.email,
        role: account.role.charAt(0).toUpperCase() + account.role.slice(1),
        joined: account.createdAt || account.updatedAt,
        status: account.status || (account.disabled ? "disabled" : 
                (account.verified ? "active" : "unverified")),
      }));
  }, [accounts, statusFilter, roleFilter, searchQuery]);

  const columnDefs = useMemo(
    () => [
      { 
        field: "username", 
        minWidth: 120,
        flex: 1 
      },
      { 
        field: "email", 
        minWidth: 180,
        flex: 1.5 
      },
      {
        field: "role",
        minWidth: 120,
        flex: 1,
        cellRenderer: RoleCell,
      },
      {
        field: "joined",
        headerName: "Joined Date",
        minWidth: 140,
        flex: 1,
        cellRenderer: DateCell,
        sortable: true,
        sort: 'desc'
      },
      {
        field: "status",
        minWidth: 120,
        flex: 1,
        cellRenderer: StatusCell,
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 250,
        maxWidth: 250,
        flex: 0,
        filter: false,
        cellRenderer: ActionsCell,
      },
    ],
    []
  );

  const theme = useMemo(() => customTheme, []);

  // Simplified onGridSizeChanged function
  const onGridSizeChanged = useCallback((params) => {
    if (gridRef.current) {
      params.api.sizeColumnsToFit();
    }
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Calculate dynamic height based on number of rows
  const calculateHeight = () => {
    const rowHeight = 60; // Height of each row
    const headerHeight = 48; // Height of the header
    const paginationHeight = 48; // Height of pagination
    const maxHeight = 600; // Maximum height
    
    const calculatedHeight = (rowData.length * rowHeight) + headerHeight + paginationHeight;
    return Math.min(calculatedHeight, maxHeight);
  };

  return (
    <>
      <div
        className="ag-theme-quartz"
        ref={gridRef}
        style={{ 
          height: `${calculateHeight()}px`,
          width: "100%",
          minHeight: "200px"
        }}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg">Loading accounts...</p>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg text-error">Error loading accounts</p>
          </div>
        ) : (
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              ...defaultColDef,
              sortable: true
            }}
            theme={theme}
            pagination={true}
            paginationPageSize={10}
            rowHeight={60}
            headerHeight={48}
            paginationPageSizeSelector={[5, 10, 20, 50]}
            onGridSizeChanged={onGridSizeChanged}
            onFirstDataRendered={onFirstDataRendered}
            domLayout="normal"
            suppressPaginationPanel={false}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <dialog id="delete_modal" className="modal" open={showDeleteModal}>
        <div className="modal-box gap-6 text-lg w-10/12 max-w-3xl p-8 sm:p-12 rounded-3xl">
          <div className="flex flex-col gap-6">
            <p className="text-center text-3xl font-bold text-error">
              Confirm Account Deletion
            </p>
            <p className="text-center text-gray-600">
              Please enter your super admin password to confirm this action
            </p>

            <div className="w-full flex flex-col gap-1">
              <label className="text-primary font-bold">
                Super Admin Password*
              </label>
              <input
                type="password"
                value={superAdminPassword}
                onChange={(e) => {
                  setSuperAdminPassword(e.target.value);
                  setAuthError("");
                }}
                className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                  authError ? "border-2 border-error" : ""
                }`}
                placeholder="Enter super admin password"
              />
              {authError && (
                <p className="text-error text-sm mt-1">{authError}</p>
              )}
            </div>

            <div className="w-full flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors hover:cursor-pointer"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className={`flex items-center gap-2 bg-error text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity hover:cursor-pointer ${
                  isSubmitting ? "opacity-70 cursor-wait" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleModalClose}>close</button>
        </form>
      </dialog>

      {/* Add new status toggle modal */}
      <dialog id="status_modal" className="modal" open={showStatusModal}>
        <div className="modal-box gap-6 text-lg w-10/12 max-w-3xl p-8 sm:p-12 rounded-3xl">
          <div className="flex flex-col gap-6">
            <p className="text-center text-3xl font-bold text-warning">
              Confirm Account {isDisabling ? 'Disable' : 'Enable'}
            </p>
            <p className="text-center text-gray-600">
              Please enter your super admin password to {isDisabling ? 'disable' : 'enable'} this account
            </p>

            <div className="w-full flex flex-col gap-1">
              <label className="text-primary font-bold">
                Super Admin Password*
              </label>
              <input
                type="password"
                value={superAdminPassword}
                onChange={(e) => {
                  setSuperAdminPassword(e.target.value);
                  setAuthError("");
                }}
                className={`p-3 bg-base-200 text-primary rounded-xl border-none ${
                  authError ? "border-2 border-error" : ""
                }`}
                placeholder="Enter super admin password"
              />
              {authError && (
                <p className="text-error text-sm mt-1">{authError}</p>
              )}
            </div>

            <div className="w-full flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="bg-gray-300 text-white px-6 py-2.5 rounded-xl hover:bg-gray-400 transition-colors hover:cursor-pointer"
                onClick={handleStatusModalClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusConfirm}
                className={`flex items-center gap-2 bg-warning text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity hover:cursor-pointer ${
                  isSubmitting ? "opacity-70 cursor-wait" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `${isDisabling ? 'Disable' : 'Enable'} Account`}
              </button>
            </div>
          </div>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleStatusModalClose}>close</button>
        </form>
      </dialog>
    </>
  );
}

export default AdminsTable;
