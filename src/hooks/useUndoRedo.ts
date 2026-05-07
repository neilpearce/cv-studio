"use client";

import * as React from "react";

type State<T> = { past: T[]; present: T; future: T[] };
type Action<T> =
  | { type: "set"; value: T; merge?: boolean }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; value: T };

const HISTORY_LIMIT = 50;

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "set": {
      if (Object.is(action.value, state.present)) return state;
      const past = action.merge && state.past.length > 0 ? state.past : [...state.past, state.present];
      const trimmed = past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past;
      return { past: trimmed, present: action.value, future: [] };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    case "reset":
      return { past: [], present: action.value, future: [] };
    default:
      return state;
  }
}

export function useUndoRedo<T>(initial: T) {
  const [state, dispatch] = React.useReducer(reducer<T>, {
    past: [],
    present: initial,
    future: [],
  } as State<T>);

  const set = React.useCallback((value: T | ((prev: T) => T), merge = false) => {
    dispatch({
      type: "set",
      value: typeof value === "function" ? (value as (prev: T) => T)(state.present) : value,
      merge,
    });
  }, [state.present]);

  const undo = React.useCallback(() => dispatch({ type: "undo" }), []);
  const redo = React.useCallback(() => dispatch({ type: "redo" }), []);
  const reset = React.useCallback((value: T) => dispatch({ type: "reset", value }), []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
