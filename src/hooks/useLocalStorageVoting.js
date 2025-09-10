import { useState, useEffect, useCallback } from "react";

const VOTES_STORAGE_KEY = "buzzmap_votes";
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useLocalStorageVoting = (
  postId,
  initialUpvotes = [],
  initialDownvotes = []
) => {
  const [localVotes, setLocalVotes] = useState({
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
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
            upvotes: postVotes.upvotes || initialUpvotes,
            downvotes: postVotes.downvotes || initialDownvotes,
            lastSynced: postVotes.lastSynced || Date.now(),
          });
        }
      } catch (error) {
        console.error("Error loading votes from localStorage:", error);
      }
    }
  }, [postId, initialUpvotes, initialDownvotes]);

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

      console.log(`[VOTE SYNC] Syncing ${votesToSync.length} posts...`);

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
      console.log("[VOTE SYNC] Sync completed");
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
