import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialUsersState = {
  name: "hoang bim",
  id: 123,
};

const usersSlide = createSlice({
  name: "users",
  initialState: initialUsersState,
  reducers: {
    addUser(state, actions) {
      state.name = [...state.name, actions.payload];
    },
  },
});
const store = configureStore({
  reducer: { users: usersSlide.reducer },
});
export const usersAction = usersSlide.actions;

export default store;
