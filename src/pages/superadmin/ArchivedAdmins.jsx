import React, { useMemo } from "react";
import { useGetDeletedAccountsQuery } from "../../api/dengueApi";
import ArchivedAccounts from "./ArchivedAccounts";

const ArchivedAdmins = () => {
  const { data: accounts, isLoading } = useGetDeletedAccountsQuery();

  // Filter for admins
  const deletedAdmins = useMemo(() => {
    if (!accounts) return [];
    return accounts.filter(account => account.role === "admin");
  }, [accounts]);

  const columns = useMemo(
    () => [
      {
        headerName: "Username",
        field: "username",
        flex: 1,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: "Email",
        field: "email",
        flex: 1,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: "Role",
        field: "role",
        flex: 1,
        filter: 'agSetColumnFilter',
        cellRenderer: (params) => {
          let bgColor = "";
          let textColor = "";

          switch (params.value.toLowerCase()) {
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
              <span className={`px-3.5 py-1 capitalize rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Auth Provider",
        field: "authProvider",
        flex: 1,
        filter: 'agSetColumnFilter',
      },
      {
        headerName: "Created At",
        field: "createdAt",
        flex: 1,
        filter: 'agDateColumnFilter',
      },
      {
        headerName: "Deleted At",
        field: "deletedAt",
        flex: 1,
        filter: 'agDateColumnFilter',
      },
    ],
    []
  );

  return (
    <ArchivedAccounts
      title="Archived Admins"
      data={deletedAdmins}
      isLoading={isLoading}
      columns={columns}
      backLink="/superadmin/admins"
      backLinkText="Back to Active Admins"
      emptyMessage="No archived admins found."
    />
  );
};

export default ArchivedAdmins; 