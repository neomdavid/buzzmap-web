import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

function UsersTable({ statusFilter, roleFilter, searchQuery }) {
  const { data: accounts, isLoading, error, refetch } = useGetAccountsQuery();
  const gridRef = useRef(null);
  
  // Add state for modals and actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBanning, setIsBanning] = useState(true);

  // Add mutations
  const [deleteAccount] = useDeleteAccountMutation();
  const [login] = useLoginMutation();
  const [toggleStatus] = useToggleAccountStatusMutation();
  const superAdminEmail = useSelector((state) => state.auth?.user?.email);

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

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
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

      await deleteAccount(selectedUser._id).unwrap();
      toastSuccess("User account deleted successfully");
      setShowDeleteModal(false);
      setSuperAdminPassword("");
      setAuthError("");
      await refetch();
    } catch (error) {
      toastError(error?.data?.message || "Failed to delete user account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setIsBanning(user.status !== "banned");
    setShowBanModal(true);
  };

  const handleBanConfirm = async () => {
    if (!superAdminPassword.trim()) {
      setAuthError("Please enter your password");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Starting ban/unban process for user:', selectedUser);
      
      const isVerified = await verifySuperAdmin();
      console.log('Super admin verification result:', isVerified);
      
      if (!isVerified) {
        setIsSubmitting(false);
        return;
      }

      const newStatus = isBanning ? "banned" : "active";
      console.log('Sending toggle status request:', {
        id: selectedUser._id,
        status: newStatus
      });

      const response = await toggleStatus({
        id: selectedUser._id,
        status: newStatus
      }).unwrap();

      console.log('Toggle status API response:', response);

      toastSuccess(`User ${isBanning ? 'banned' : 'unbanned'} successfully`);
      setShowBanModal(false);
      setSuperAdminPassword("");
      setAuthError("");
      
      console.log('Refreshing data...');
      await refetch();
      
    } catch (error) {
      console.error('Error in handleBanConfirm:', {
        error,
        errorMessage: error?.data?.message,
        errorStatus: error?.status
      });
      toastError(error?.data?.message || `Failed to ${isBanning ? 'ban' : 'unban'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowDeleteModal(false);
    setShowBanModal(false);
    setSelectedUser(null);
    setSuperAdminPassword("");
    setAuthError("");
    setIsSubmitting(false);
  };

  // Move ActionsCell inside UsersTable component
  const ActionsCell = useCallback((p) => {
    const showBanButton = p.data.status === 'active' || p.data.status === 'banned';
    
    return (
      <div className="py-2 h-full w-full flex items-center gap-2">
        <button className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md">
          <IconSearch size={13} stroke={2.5} />
          <p className="text-sm">view</p>
        </button>
        {showBanButton && (
          <button 
            onClick={() => handleBanClick(p.data)}
            className="flex items-center gap-1 text-warning hover:bg-gray-200 p-1 rounded-md"
          >
            <IconBan size={15} stroke={2} />
            <p className="text-sm">{p.data.status === "banned" ? "unban" : "ban"}</p>
          </button>
        )}
        <button 
          onClick={() => handleDeleteClick(p.data)}
          className="flex items-center gap-1 text-error hover:bg-gray-200 p-1 rounded-md"
        >
          <IconTrash size={15} stroke={2.5} />
          <p className="text-sm">remove</p>
        </button>
      </div>
    );
  }, []); // Add empty dependency array since handlers are stable

  // Transform the data for the grid
  const rowData = useMemo(() => {
    if (!accounts) return [];
    
    console.log('Raw accounts data before transformation:', accounts);
    
    const transformedData = accounts
      .filter(account => {
        // First filter for users only and not deleted
        const isUser = account.role === 'user';
        const isNotDeleted = account.status !== 'deleted';
        
        // Then apply status filter
        const statusMatch = !statusFilter || account.status === statusFilter;
        
        // Then apply role filter
        const roleMatch = !roleFilter || account.role === roleFilter;

        // Apply search filter
        const searchMatch = !searchQuery || 
          account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account.email.toLowerCase().includes(searchQuery.toLowerCase());

        return isUser && isNotDeleted && statusMatch && roleMatch && searchMatch;
      })
      .map(account => ({
        _id: account._id,
        username: account.username,
        email: account.email,
        role: account.role,
        joined: account.createdAt || account.updatedAt,
        status: account.status,
      }));

    console.log('Final transformed data:', transformedData);
    return transformedData;
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
        minWidth: 100, 
        cellRenderer: RoleCell,
        flex: 1 
      },
      {
        field: "joined",
        headerName: "Joined Date",
        minWidth: 140,
        cellRenderer: DateCell,
        flex: 1,
        sortable: true,
        sort: 'desc'
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        cellRenderer: StatusCell,
        flex: 1
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 200,
        maxWidth: 200,
        flex: 0,
        filter: false,
        cellRenderer: ActionsCell,
      },
    ],
    [ActionsCell] // Add ActionsCell to dependencies
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
            <p className="text-lg">Loading users...</p>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg text-error">Error loading users</p>
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
          <form onSubmit={(e) => { e.preventDefault(); handleDeleteConfirm(); }}>
            <div className="flex flex-col gap-6">
              <p className="text-center text-3xl font-bold text-error">
                Confirm User Deletion
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
                  type="submit"
                  className={`flex items-center gap-2 bg-error text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity hover:cursor-pointer ${
                    isSubmitting ? "opacity-70 cursor-wait" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Delete User"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={handleModalClose}>close</button>
        </form>
      </dialog>

      {/* Ban Confirmation Modal */}
      <dialog id="ban_modal" className="modal" open={showBanModal}>
        <div className="modal-box gap-6 text-lg w-10/12 max-w-3xl p-8 sm:p-12 rounded-3xl">
          <form onSubmit={(e) => { e.preventDefault(); handleBanConfirm(); }}>
            <div className="flex flex-col gap-6">
              <p className="text-center text-3xl font-bold text-warning">
                Confirm User {isBanning ? 'Ban' : 'Unban'}
              </p>
              <p className="text-center text-gray-600">
                Please enter your super admin password to {isBanning ? 'ban' : 'unban'} this user
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
                  type="submit"
                  className={`flex items-center gap-2 bg-warning text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity hover:cursor-pointer ${
                    isSubmitting ? "opacity-70 cursor-wait" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : `${isBanning ? 'Ban' : 'Unban'} User`}
                </button>
              </div>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={handleModalClose}>close</button>
        </form>
      </dialog>
    </>
  );
}

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
    case "active":
      bgColor = "bg-success";
      textColor = "text-white";
      break;
    case "unverified":
      bgColor = "bg-warning";
      textColor = "text-white";
      break;
    case "banned":
      bgColor = "bg-error";
      textColor = "text-white";
      break;
    case "removed":
      bgColor = "bg-red-400";
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

  switch (value) {
    case "admin":
      bgColor = "bg-blue-500";
      textColor = "text-white";
      break;
    case "moderator":
      bgColor = "bg-teal-500";
      textColor = "text-white";
      break;
    case "user":
      bgColor = "bg-gray-500";
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

export default UsersTable;
