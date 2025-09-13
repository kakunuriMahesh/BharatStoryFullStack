import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchStories, addStory, updateStory, deleteStory, setFilteredStories, clearStories } from '../store/slices/storiesSlice';
import Cookies from 'js-cookie';

export const useStories = () => {
  const dispatch = useDispatch();
  const { stories, filteredStories, loading, error, lastFetched } = useSelector(state => state.stories);

  // Smart fetch function - only fetches if stories are empty or older than 5 minutes
  const smartFetchStories = async () => {
    const token = Cookies.get('token');
    if (!token) return;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Only fetch if:
    // 1. Stories array is empty, OR
    // 2. Last fetch was more than 5 minutes ago
    if (stories.length === 0 || !lastFetched || (now - lastFetched) > fiveMinutes) {
      console.log('Fetching stories from API...');
      dispatch(fetchStories(token));
    } else {
      console.log('Using cached stories from Redux store');
    }
  };

  // Force fetch function - always fetches from API
  const forceFetchStories = async () => {
    const token = Cookies.get('token');
    if (!token) return;
    console.log('Force fetching stories from API...');
    dispatch(fetchStories(token));
  };

  // Add story function
  const addStoryAction = async (data) => {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');
    return dispatch(addStory({ data, token }));
  };

  // Update story function
  const updateStoryAction = async (id, data) => {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');
    return dispatch(updateStory({ id, data, token }));
  };

  // Delete story function
  const deleteStoryAction = async (id) => {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');
    return dispatch(deleteStory({ id, token }));
  };

  // Search function
  const searchStories = (selectedStory, query) => {
    let filtered = stories;

    if (selectedStory) {
      filtered = filtered.filter(story => story.name.en === selectedStory);
    }

    if (query) {
      filtered = filtered.filter(story =>
        story.name.en.toLowerCase().includes(query.toLowerCase()) ||
        story.name.te.toLowerCase().includes(query.toLowerCase()) ||
        story.name.hi.toLowerCase().includes(query.toLowerCase())
      );
    }

    dispatch(setFilteredStories(filtered));
  };

  // Clear stories function (useful for logout)
  const clearStoriesAction = () => {
    dispatch(clearStories());
  };

  return {
    stories,
    filteredStories,
    loading,
    error,
    smartFetchStories,
    forceFetchStories,
    addStory: addStoryAction,
    updateStory: updateStoryAction,
    deleteStory: deleteStoryAction,
    searchStories,
    clearStories: clearStoriesAction,
  };
};
