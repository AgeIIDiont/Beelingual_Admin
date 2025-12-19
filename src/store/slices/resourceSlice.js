import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTopics as fetchAllTopics, fetchCategories as fetchGrammarCategories } from '../../services/adminService';

// Async thunks for fetching resources
export const fetchTopicsAction = createAsyncThunk(
    'resources/fetchTopics',
    async (_, { getState, rejectWithValue }) => {
        const { resources } = getState();
        if (resources.topics.loaded) return resources.topics.data;
        try {
            const response = await fetchAllTopics();
            return Array.isArray(response) ? response : (response.data || response.items || []);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGrammarCategoriesAction = createAsyncThunk(
    'resources/fetchGrammarCategories',
    async (_, { getState, rejectWithValue }) => {
        const { resources } = getState();
        if (resources.grammarCategories.loaded) return resources.grammarCategories.data;
        try {
            const response = await fetchGrammarCategories();
            return Array.isArray(response) ? response : (response.data || response.items || []);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    topics: {
        data: [],
        loading: false,
        loaded: false,
        error: null,
    },
    grammarCategories: {
        data: [],
        loading: false,
        loaded: false,
        error: null,
    },
};

const resourceSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {
        invalidateResources: (state) => {
            state.topics.loaded = false;
            state.grammarCategories.loaded = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Topics
            .addCase(fetchTopicsAction.pending, (state) => {
                state.topics.loading = true;
            })
            .addCase(fetchTopicsAction.fulfilled, (state, action) => {
                state.topics.loading = false;
                state.topics.loaded = true;
                state.topics.data = action.payload;
            })
            .addCase(fetchTopicsAction.rejected, (state, action) => {
                state.topics.loading = false;
                state.topics.error = action.payload;
            })
            // Grammar Categories
            .addCase(fetchGrammarCategoriesAction.pending, (state) => {
                state.grammarCategories.loading = true;
            })
            .addCase(fetchGrammarCategoriesAction.fulfilled, (state, action) => {
                state.grammarCategories.loading = false;
                state.grammarCategories.loaded = true;
                state.grammarCategories.data = action.payload;
            })
            .addCase(fetchGrammarCategoriesAction.rejected, (state, action) => {
                state.grammarCategories.loading = false;
                state.grammarCategories.error = action.payload;
            });
    },
});

export const { invalidateResources } = resourceSlice.actions;

export const selectTopics = (state) => state.resources.topics.data;
export const selectGrammarCategories = (state) => state.resources.grammarCategories.data;
export const selectResourcesLoading = (state) => state.resources.topics.loading || state.resources.grammarCategories.loading;

export default resourceSlice.reducer;
