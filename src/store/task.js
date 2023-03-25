import { createAction, createSlice } from '@reduxjs/toolkit';
import todosService from '../services/todos.service';
import { setError } from './errors';

const initialState = { entities: [], isLoading: true };

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    received(state, action) {
      state.entities = action.payload;
      state.isLoading = false;
    },
    update(state, action) {
      const elementIndex = state.entities.findIndex(
        (e) => e.id === action.payload.id
      );
      state.entities[elementIndex] = {
        ...state.entities[elementIndex],
        ...action.payload,
      };
    },
    remove(state, action) {
      state.entities = state.entities.filter((t) => t.id !== action.payload.id);
    },
    loadTaskRequested(state, action) {
      state.isLoading = true;
    },

    taskRequestFailed(state, action) {
      state.isLoading = false;
    },
    taskAdded(state, action) {
      state.entities.push(action.payload);
    },
  },
});

const { reducer: taskReducer, actions } = taskSlice;
const {
  update,
  remove,
  received,
  taskRequestFailed,
  taskAdded,
  loadTaskRequested,
} = actions;

const taskRequested = createAction('task/requested');

export const loadTasks = () => async (dispatch) => {
  dispatch(loadTaskRequested());
  try {
    const data = await todosService.fetch();
    dispatch(received(data));
  } catch (error) {
    dispatch(taskRequestFailed());
    dispatch(setError(error.message));
  }
};

export const createTask = (task) => async (dispatch) => {
  dispatch(taskRequested());
  try {
    const data = await todosService.create(task);
    dispatch(taskAdded(data));
  } catch (error) {
    dispatch(taskRequestFailed());
    dispatch(setError(error.message));
  }
};

export const completeTask = (id) => (dispatch, getState) => {
  dispatch(update({ id, completed: true }));
};

export function titleChanged(id) {
  return update({ id, title: `New title for task ${id}` });
}

export function taskDeleted(id) {
  return remove({ id });
}

export const getTasks = () => (state) => state.tasks.entities;
export const getTaskLoadingStatus = () => (state) => state.tasks.isLoading;

export default taskReducer;