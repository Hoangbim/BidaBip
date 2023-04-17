import { configureStore, createSlice } from "@reduxjs/toolkit";
import { getLocale } from "../hooks/useHttp";
const userLocale = getLocale();

const initialUsersState = {
  name: "hoang bim",
  id: 123,
  locale: userLocale ? userLocale : "en_US",
};

const usersSlide = createSlice({
  name: "users",
  initialState: initialUsersState,
  reducers: {
    setLocale(state, action) {
      state.locale = action.payload;
    },
  },
});

const store = configureStore({
  reducer: { users: usersSlide.reducer },
});
export const usersAction = usersSlide.actions;

export default store;
