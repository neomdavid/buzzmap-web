import React, { useMemo } from "react";
import { useGetDeletedAccountsQuery } from "../../api/dengueApi";
import ArchivedAccounts from "./ArchivedAccounts";

const ArchivedUsers = () => {
  const { data: accounts, isLoading } = useGetDeletedAccountsQuery();

  // Filter for users
  const deletedUsers = useMemo(() => {
    if (!accounts) return [];
    return accounts.filter(account => account.role === "user");
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

          switch (params.value) {
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
      title="Archived Users"
      data={deletedUsers}
      isLoading={isLoading}
      columns={columns}
      backLink="/superadmin/users"
      backLinkText="Back to Active Users"
      emptyMessage="No archived users found."
    />
  );
};

export default ArchivedUsers; 