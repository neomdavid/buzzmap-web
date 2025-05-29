import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import {
  useGetAllAdminPostsQuery,
  useUpdateAdminPostMutation,
  useDeleteAdminPostMutation,
} from "../../api/dengueApi";
import { useSelector } from "react-redux";
import { toastSuccess, toastError } from "../../utils";

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

const Archives = () => {
  const token = useSelector((state) => state.auth.token);
  const { data: adminPosts, isLoading } = useGetAllAdminPostsQuery(undefined, {
    skip: !token,
  });
  const [updateAdminPost] = useUpdateAdminPostMutation();
  const [deleteAdminPost] = useDeleteAdminPostMutation();
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [paginationPageSize, setPaginationPageSize] = useState(10);
  const [paginationPageSizeOptions] = useState([5, 10, 20, 50]);

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

  const rows = useMemo(
    () =>
      (adminPosts || [])
        .filter(post => post.status === "archived")
        .map((post) => ({
          ...post,
          publishDate: post.publishDate
            ? new Date(post.publishDate).toLocaleString()
            : "N/A",
        })),
    [adminPosts]
  );

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingPost({
        ...editingPost,
        images: [file] // Store the file object directly
      });
    }
  };

  // Handle save from modal
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editingPost.title);
      formData.append('content', editingPost.content);
      formData.append('category', editingPost.category);
      formData.append('publishDate', new Date().toISOString());

      await updateAdminPost({
        id: editingPost.id || editingPost._id,
        formData: formData
      }).unwrap();

      setEditingPost(null);
      toastSuccess("Post updated successfully!");
    } catch (error) {
      console.error('Error updating post:', error);
      const errorMessage = error.data?.message || error.error || "Failed to update post";
      toastError(errorMessage);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await deleteAdminPost(deletingPost.id || deletingPost._id).unwrap();
      setTimeout(() => {
        setDeletingPost(null);
        toastSuccess("Post deleted successfully!");
      }, 0);
    } catch (error) {
      console.error('Error deleting post:', error);
      toastError("Failed to delete post");
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold">Archived Posts</p>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="h-[500px] flex items-center justify-center text-gray-500">
          No archived posts found.
        </div>
      ) : (
        <div className="ag-theme-quartz h-[500px] w-full">
          <AgGridReact
            rowData={rows}
            columnDefs={columns}
            suppressRowClickSelection
            suppressCellFocus
            theme={customTheme}
            domLayout="normal"
            pagination={true}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={paginationPageSizeOptions}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            style={{
              height: '100%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Archives; 