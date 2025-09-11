import { useState, useEffect, useRef } from "react";

export const useBarangayData = (barangaysList, posts) => {
  const [barangayData, setBarangayData] = useState(null);
  const [breedingSites, setBreedingSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch barangay geojson
        const barangayResponse = await fetch(
          "/quezon_barangays_boundaries.geojson"
        );
        if (!barangayResponse.ok)
          throw new Error("Failed to load barangay data");
        const barangayGeoJson = await barangayResponse.json();

        if (isMountedRef.current) {
          setBarangayData(barangayGeoJson);
        }

        // Process breeding sites
        if (posts) {
          const validPosts = Array.isArray(posts?.posts)
            ? posts.posts
            : Array.isArray(posts)
            ? posts
            : [];
          const validatedSites = validPosts.filter(
            (post) =>
              post.status === "Validated" &&
              post.specific_location &&
              Array.isArray(post.specific_location.coordinates) &&
              post.specific_location.coordinates.length === 2
          );
          if (isMountedRef.current) {
            setBreedingSites(validatedSites);
          }
        } else {
          if (isMountedRef.current) {
            setBreedingSites([]);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMountedRef.current) {
          setError(err.message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, []); // Only run once on mount

  // Update breeding sites when posts change
  useEffect(() => {
    if (posts && barangayData) {
      const validPosts = Array.isArray(posts?.posts)
        ? posts.posts
        : Array.isArray(posts)
        ? posts
        : [];
      const validatedSites = validPosts.filter(
        (post) =>
          post.status === "Validated" &&
          post.specific_location &&
          Array.isArray(post.specific_location.coordinates) &&
          post.specific_location.coordinates.length === 2
      );
      if (isMountedRef.current) {
        setBreedingSites(validatedSites);
      }
    }
  }, [posts, barangayData]);

  return {
    barangayData,
    breedingSites,
    loading,
    error,
  };
};
