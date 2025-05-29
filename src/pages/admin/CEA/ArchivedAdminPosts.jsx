import React, { useMemo } from "react";
import { useGetAllAdminPostsQuery } from "../../../api/dengueApi";
import { useSelector } from "react-redux";
import Archives from "./Archives";

const ArchivedAdminPosts = () => {
  const token = useSelector((state) => state.auth.token);
  const { data: adminPosts, isLoading } = useGetAllAdminPostsQuery(undefined, {
    skip: !token,
  });

  const columns = useMemo(
    () => [
      {
        headerName: "Title",
        field: "title",
        flex: 1,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: "Category",
        field: "category",
        flex: 1,
        filter: 'agSetColumnFilter',
      },
      {
        headerName: "Content",
        field: "content",
        flex: 2,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: "Publish Date",
        field: "publishDate",
        flex: 1,
        filter: 'agDateColumnFilter',
      },
      {
        headerName: "Image",
        field: "images",
        flex: 1,
        filter: false,
        cellRenderer: (params) => {
          return params.value && params.value.length > 0 ? (
            <img
              src={params.value[0]}
              alt="post"
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ) : (
            "No image"
          );
        },
      },
    ],
    []
  );

  return (
    <Archives
      title="Archived Admin Posts"
      data={adminPosts}
      isLoading={isLoading}
      columns={columns}
      backLink="/admin/cea"
      backLinkText="Back to Active Posts"
      emptyMessage="No archived admin posts found."
    />
  );
};

export default ArchivedAdminPosts; 