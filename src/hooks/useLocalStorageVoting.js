import { useState, useEffect, useCallback } from "react";

const VOTES_STORAGE_KEY = "buzzmap_votes";
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Helper function to normalize vote arrays from API format to our format
const normalizeVoteArray = (votes) => {
  if (!Array.isArray(votes)) return [];
  return votes.map((vote) =>
    typeof vote === "object" && vote._id ? vote._id : vote
  );
};

export const useLocalStorageVoting = (
  postId,
  initialUpvotes = [],
  initialDownvotes = []
) => {
  // Normalize the initial data from API
  const normalizedUpvotes = normalizeVoteArray(initialUpvotes);
  const normalizedDownvotes = normalizeVoteArray(initialDownvotes);

  const [localVotes, setLocalVotes] = useState({
    upvotes: normalizedUpvotes,
    downvotes: normalizedDownvotes,
    lastSynced: Date.now(),
  });

  // Load votes from localStorage on mount
  useEffect(() => {
    const savedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
    if (savedVotes) {
      try {
        const allVotes = JSON.parse(savedVotes);
        const postVotes = allVotes[postId];
        if (postVotes) {
          setLocalVotes({
            upvotes: normalizeVoteArray(postVotes.upvotes) || normalizedUpvotes,
            downvotes:
              normalizeVoteArray(postVotes.downvotes) || normalizedDownvotes,
            lastSynced: postVotes.lastSynced || Date.now(),
          });
        }
      } catch (error) {
        console.error("Error loading votes from localStorage:", error);
      }
    } else {
      // If no saved votes, use initial data from API
      setLocalVotes({
        upvotes: normalizedUpvotes,
        downvotes: normalizedDownvotes,
        lastSynced: Date.now(),
      });
    }
  }, [postId, initialUpvotes, initialDownvotes]);

  // Update local votes when initial data changes (from API)
  useEffect(() => {
    const newNormalizedUpvotes = normalizeVoteArray(initialUpvotes);
    const newNormalizedDownvotes = normalizeVoteArray(initialDownvotes);

    // Always update with fresh API data if it's different
    setLocalVotes((prev) => {
      // Check if we have localStorage data for this post
      const savedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
      if (savedVotes) {
        try {
          const allVotes = JSON.parse(savedVotes);
          const postVotes = allVotes[postId];
          if (postVotes) {
            // Use localStorage data if available
            return prev;
          }
        } catch (error) {
          console.error("Error checking localStorage:", error);
        }
      }

      // Use API data if no localStorage data
      return {
        upvotes: newNormalizedUpvotes,
        downvotes: newNormalizedDownvotes,
        lastSynced: Date.now(),
      };
    });
  }, [initialUpvotes, initialDownvotes, postId]);

  // Save votes to localStorage
  const saveVotesToStorage = useCallback(
    (upvotes, downvotes) => {
      try {
        const savedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
        const allVotes = savedVotes ? JSON.parse(savedVotes) : {};

        allVotes[postId] = {
          upvotes,
          downvotes,
          lastSynced: Date.now(),
        };

        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(allVotes));
      } catch (error) {
        console.error("Error saving votes to localStorage:", error);
      }
    },
    [postId]
  );

  // Update votes locally and save to localStorage
  const updateVotes = useCallback(
    (newUpvotes, newDownvotes) => {
      const updatedVotes = {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        lastSynced: Date.now(),
      };

      setLocalVotes(updatedVotes);
      saveVotesToStorage(newUpvotes, newDownvotes);
    },
    [saveVotesToStorage]
  );

  // Get current user's vote status
  const getUserVoteStatus = useCallback(
    (userId) => {
      if (!userId) return { hasUpvoted: false, hasDownvoted: false };

      const hasUpvoted = localVotes.upvotes.some((vote) =>
        typeof vote === "object" ? vote._id === userId : vote === userId
      );
      const hasDownvoted = localVotes.downvotes.some((vote) =>
        typeof vote === "object" ? vote._id === userId : vote === userId
      );

      return { hasUpvoted, hasDownvoted };
    },
    [localVotes]
  );

  // Calculate net votes
  const netVotes = localVotes.upvotes.length - localVotes.downvotes.length;

  // Check if votes need syncing (older than 5 minutes)
  const needsSync = Date.now() - localVotes.lastSynced > SYNC_INTERVAL;

  return {
    upvotes: localVotes.upvotes,
    downvotes: localVotes.downvotes,
    netVotes,
    updateVotes,
    getUserVoteStatus,
    needsSync,
    lastSynced: localVotes.lastSynced,
  };
};

// Hook for managing background sync
export const useVoteSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncAllVotes = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const savedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
      if (!savedVotes) return;

      const allVotes = JSON.parse(savedVotes);
      const now = Date.now();

      // Find votes that need syncing
      const votesToSync = Object.entries(allVotes).filter(
        ([postId, votes]) => now - votes.lastSynced > SYNC_INTERVAL
      );

      // Here you would implement the actual sync logic
      // For now, we'll just update the lastSynced timestamp
      const updatedVotes = { ...allVotes };
      votesToSync.forEach(([postId, votes]) => {
        updatedVotes[postId] = {
          ...votes,
          lastSynced: now,
        };
      });

      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(updatedVotes));
    } catch (error) {
      console.error("[VOTE SYNC] Error syncing votes:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Set up periodic sync
  useEffect(() => {
    const interval = setInterval(syncAllVotes, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [syncAllVotes]);

  return { syncAllVotes, isSyncing };
};
