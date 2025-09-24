import React, { useMemo, useState, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import {
  useGetAllAdminPostsQuery,
  useUpdateAdminPostMutation,
  useDeleteAdminPostMutation,
} from "../../api/dengueApi";
import { useSelector } from "react-redux";
import { toastSuccess, toastError } from "../../utils";
import { Link } from "react-router-dom";

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

const DateCell = (p) => {
  const date = p.value;
  return (
    <div className="flex items-center justify-center h-full">
      {date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })}
    </div>
  );
};

const AdminPostsTable = () => {
  const token = useSelector((state) => state.auth.token);
  const {
    data: adminPosts,
    isLoading,
    refetch,
  } = useGetAllAdminPostsQuery(undefined, {
    skip: !token,
  });
  const [updateAdminPost] = useUpdateAdminPostMutation();
  const [deleteAdminPost] = useDeleteAdminPostMutation();
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const editDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paginationPageSize, setPaginationPageSize] = useState(10);
  const [paginationPageSizeOptions] = useState([5, 10, 20, 50]);

  const stringCollator = useMemo(
    () =>
      new Intl.Collator(undefined, {
        sensitivity: "base",
        numeric: true,
        ignorePunctuation: true,
      }),
    []
  );

  const normalizeForSort = (value) =>
    (value ?? "").toString().trim().replace(/\s+/g, " ");

  const columns = useMemo(
    () => [
      {
        headerName: "Title",
        field: "title",
        flex: 1,
        filter: "agTextColumnFilter",
        sortable: false,
      },
      {
        headerName: "Category",
        field: "category",
        flex: 1,
        filter: "agTextColumnFilter",
        comparator: (a, b) =>
          stringCollator.compare(normalizeForSort(a), normalizeForSort(b)),
      },
      {
        headerName: "Publish Date",
        field: "publishDate",
        flex: 1,
        filter: "agDateColumnFilter",
        cellRenderer: DateCell,
        sort: "desc", // Default sort by date descending
        comparator: (dateA, dateB) => {
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        headerName: "Image",
        field: "images",
        flex: 1,
        filter: false,
        sortable: false,
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
      {
        headerName: "Actions",
        field: "actions",
        filter: false,
        sortable: false,
        cellRenderer: (params) => (
          <div className="flex w-full h-full items-center justify-center gap-2">
            <button
              onClick={() => {
                setEditingPost(params.data);
                editDialogRef.current?.showModal();
              }}
              className="btn btn-md text-white rounded-full px-6 btn-primary"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDeletingPost(params.data);
                deleteDialogRef.current?.showModal();
              }}
              className="btn btn-md text-white rounded-full px-6 btn-error"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      (adminPosts || [])
        .filter((post) => post.status === "active")
        .map((post) => ({
          ...post,
          publishDate: post.publishDate ? new Date(post.publishDate) : null,
        })),
    [adminPosts]
  );

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingPost({
        ...editingPost,
        images: [file], // Store the file object directly
      });
    }
  };

  // Handle save from modal
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", editingPost.title);
      formData.append("content", editingPost.content);
      formData.append("category", editingPost.category);
      formData.append("publishDate", new Date().toISOString());

      await updateAdminPost({
        id: editingPost.id || editingPost._id,
        formData: formData,
      }).unwrap();

      await refetch();
      setEditingPost(null);
      editDialogRef.current?.close();
      toastSuccess("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      const errorMessage =
        error.data?.message || error.error || "Failed to update post";
      toastError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteAdminPost(deletingPost.id || deletingPost._id).unwrap();
      setTimeout(async () => {
        await refetch();
        setDeletingPost(null);
        deleteDialogRef.current?.close();
        toastSuccess("Post deleted successfully!");
      }, 0);
    } catch (error) {
      console.error("Error deleting post:", error);
      toastError("Failed to delete post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ARIA: fix AG Grid roles for accessibility
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applyAriaRoles = () => {
      try {
        const root = container.querySelector(".ag-root");
        if (!root) return false;
        root.setAttribute("role", "grid");
        const headerViewport = root.querySelector(".ag-header-viewport");
        if (headerViewport) {
          headerViewport.setAttribute("role", "rowgroup");
          const headerRow = root.querySelector(".ag-header-row");
          if (headerRow) headerRow.setAttribute("role", "row");
          headerViewport
            .querySelectorAll(".ag-header-cell")
            .forEach((cell) => cell.setAttribute("role", "columnheader"));
          root
            .querySelectorAll(".ag-header-container")
            .forEach((el) => el.setAttribute("role", "presentation"));
        }
        root
          .querySelectorAll(".ag-center-cols-container .ag-row")
          .forEach((row) => row.setAttribute("role", "row"));
        root
          .querySelectorAll(".ag-center-cols-container .ag-cell")
          .forEach((cell) => cell.setAttribute("role", "gridcell"));
        const rowCount =
          root.querySelectorAll(".ag-center-cols-container .ag-row").length ||
          0;
        const colCount =
          root.querySelectorAll(".ag-header .ag-header-cell").length || 0;
        root.setAttribute("aria-rowcount", String(rowCount));
        root.setAttribute("aria-colcount", String(colCount));
        return true;
      } catch {
        return false;
      }
    };

    const done = applyAriaRoles();
    if (!done) {
      const raf = requestAnimationFrame(() => applyAriaRoles());
      const observer = new MutationObserver(() => applyAriaRoles());
      observer.observe(container, { childList: true, subtree: true });
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    }
  }, [rows, columns]);

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold">Recent Admin Posts</p>
        <Link
          to="/admin/cea/ap/archives"
          className="btn btn-outline rounded-full"
        >
          View Archives
        </Link>
      </div>
      {isLoading ? (
        <div className="h-[500px]">
          <div className="skeleton h-8 w-56 mb-4 rounded-xl" />
          <div className="skeleton h-[440px] w-full rounded-2xl" />
        </div>
      ) : rows.length === 0 ? (
        <div className="h-[500px] flex items-center justify-center text-gray-500">
          No active posts to display.
        </div>
      ) : (
        <div className="ag-theme-quartz h-[500px] w-full" ref={containerRef}>
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
              height: "100%",
            }}
          />
        </div>
      )}

      {/* Edit Dialog */}
      <dialog ref={editDialogRef} className="modal">
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-5xl p-12 relative">
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500"
            onClick={() => {
              editDialogRef.current?.close();
              setEditingPost(null);
            }}
          >
            ✕
          </button>

          {editingPost && (
            <form onSubmit={handleSave} className="space-y-4">
              <p className="text-3xl font-extrabold mb-4">Edit Admin Post</p>

              <div className="form-control">
                <label className="label text-primary text-lg font-bold mb-1">
                  Title
                </label>
                <input
                  name="title"
                  value={editingPost.title}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, title: e.target.value })
                  }
                  className="input border-0 rounded-lg w-full bg-base-200 text-lg py-2"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-primary text-lg font-bold mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={editingPost.category}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, category: e.target.value })
                  }
                  className="select border-0 rounded-lg w-full bg-base-200 text-lg py-2"
                  required
                >
                  <option value="news">News</option>
                  <option value="announcement">Announcement</option>
                  <option value="tip">Tip</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-primary text-lg font-bold mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={editingPost.content}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, content: e.target.value })
                  }
                  className="textarea border-0 rounded-lg w-full bg-base-200 text-lg py-2"
                  rows="6"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-primary text-lg font-bold mb-1">
                  Last Updated
                </label>
                <div className="p-3 bg-base-200 rounded-lg">
                  {new Date().toLocaleString()}
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-primary text-white rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>

      {/* Delete Dialog */}
      <dialog
        ref={deleteDialogRef}
        className="modal transition-transform duration-300 ease-in-out"
      >
        <div className="modal-box border-t-10 border-t-error bg-white rounded-3xl shadow-2xl w-6/12 max-w-4xl p-6 py-14 relative">
          <button
            className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => {
              deleteDialogRef.current?.close();
              setDeletingPost(null);
            }}
          >
            ✕
          </button>

          <div className="space-y-6">
            <p className="text-center text-3xl font-bold mb-2">
              <span className="text-error">Confirm Deletion</span>
            </p>
            <hr className="border-gray-300" />

            <div className="text-center ">
              <p className="text-xl mb-8">
                Are you sure you want to delete this admin post?
              </p>
              <div className="flex justify-center gap-6">
                <button
                  onClick={handleDelete}
                  className="bg-error text-white font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200 flex items-center gap-2 hover:cursor-pointer disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button
                  onClick={() => {
                    deleteDialogRef.current?.close();
                    setDeletingPost(null);
                  }}
                  className="bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200 hover:cursor-pointer disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AdminPostsTable;
