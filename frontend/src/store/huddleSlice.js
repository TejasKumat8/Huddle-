import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, withGuestIdentity } from "../lib/api";

const initialState = {
  list: [],
  current: null,
  status: "idle",
  actionStatus: "idle", // separate flag for votes/rsvp so the list view doesn't flash a loading state
  error: null,
};

export const fetchMyHuddles = createAsyncThunk("huddles/fetchMine", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/huddles");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Couldn't load your huddles");
  }
});

export const fetchHuddleById = createAsyncThunk(
  "huddles/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/huddles/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't load this huddle");
    }
  }
);

export const fetchHuddleByInviteCode = createAsyncThunk(
  "huddles/fetchByInvite",
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/huddles/invite/${code}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "We couldn't find that huddle");
    }
  }
);

export const createHuddle = createAsyncThunk(
  "huddles/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/huddles", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't create the huddle");
    }
  }
);

export const joinHuddle = createAsyncThunk(
  "huddles/join",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/huddles/${id}/join`, withGuestIdentity());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't join this huddle");
    }
  }
);

export const setRsvp = createAsyncThunk(
  "huddles/rsvp",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/huddles/${id}/rsvp`, withGuestIdentity({ status }));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't update your RSVP");
    }
  }
);

export const voteDate = createAsyncThunk(
  "huddles/voteDate",
  async ({ id, optionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/huddles/${id}/vote/date/${optionId}`, withGuestIdentity());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't register your vote");
    }
  }
);

export const voteLocation = createAsyncThunk(
  "huddles/voteLocation",
  async ({ id, optionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/huddles/${id}/vote/location/${optionId}`, withGuestIdentity());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't register your vote");
    }
  }
);

export const addLocationOption = createAsyncThunk(
  "huddles/addLocationOption",
  async ({ id, ...location }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/huddles/${id}/options/location`, location);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't add that spot");
    }
  }
);

export const finalizeHuddle = createAsyncThunk(
  "huddles/finalize",
  async ({ id, dateOptionId, locationOptionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/huddles/${id}/finalize`, { dateOptionId, locationOptionId });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Couldn't finalize this huddle");
    }
  }
);

const huddleSlice = createSlice({
  name: "huddles",
  initialState,
  reducers: {
    clearCurrentHuddle(state) {
      state.current = null;
    },
    clearHuddleError(state) {
      state.error = null;
    },
    // Applied when a Socket.io "huddleUpdated" event comes in — someone
    // else voted/RSVP'd/finalized and we want the board to update live
    // without the current user having to trigger a fetch themselves.
    receiveLiveHuddleUpdate(state, action) {
      if (state.current && state.current._id === action.payload._id) {
        state.current = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyHuddles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyHuddles.fulfilled, (state, action) => {
        state.status = "idle";
        state.list = action.payload;
      })
      .addCase(fetchMyHuddles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createHuddle.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.current = action.payload;
      });

    // Every other huddle-detail action (fetch, join, rsvp, vote, finalize)
    // updates `current` the same way once it resolves.
    const detailActions = [
      fetchHuddleById,
      fetchHuddleByInviteCode,
      joinHuddle,
      setRsvp,
      voteDate,
      voteLocation,
      addLocationOption,
      finalizeHuddle,
    ];

    detailActions.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionStatus = "loading";
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.actionStatus = "idle";
          state.current = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionStatus = "failed";
          state.error = action.payload;
        });
    });
  },
});

export const { clearCurrentHuddle, clearHuddleError, receiveLiveHuddleUpdate } = huddleSlice.actions;
export default huddleSlice.reducer;
