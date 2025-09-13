import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching stories
export const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for adding a story
export const addStory = createAsyncThunk(
  'stories/addStory',
  async ({ data, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/stories`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      return response.data.story;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating a story
export const updateStory = createAsyncThunk(
  'stories/updateStory',
  async ({ id, data, token }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/stories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      return response.data.story;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting a story
export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/stories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const storiesSlice = createSlice({
  name: 'stories',
  initialState: {
    stories: [],
    filteredStories: [],
    loading: false,
    error: null,
    lastFetched: null, // Track when stories were last fetched
  },
  reducers: {
    setFilteredStories: (state, action) => {
      state.filteredStories = action.payload;
    },
    clearStories: (state) => {
      state.stories = [];
      state.filteredStories = [];
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stories
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
        state.filteredStories = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add story
      .addCase(addStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories.push(action.payload);
        state.filteredStories.push(action.payload);
        state.error = null;
      })
      .addCase(addStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update story
      .addCase(updateStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stories.findIndex(story => story.id === action.payload.id);
        if (index !== -1) {
          state.stories[index] = action.payload;
          state.filteredStories[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete story
      .addCase(deleteStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = state.stories.filter(story => story.id !== action.payload);
        state.filteredStories = state.filteredStories.filter(story => story.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilteredStories, clearStories, clearError } = storiesSlice.actions;
export default storiesSlice.reducer;
