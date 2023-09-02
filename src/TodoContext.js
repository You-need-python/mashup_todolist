/* eslint-disable no-fallthrough */
import React, { useReducer, createContext, useContext } from "react";
import axios from "axios";

let initialTodos;
let isRequesting = false; // 클릭 가능 여부를 나타내는 변수

axios
  .get("http://localhost:8000/")
  .then((response) => {
    initialTodos = response.data;
    console.log(initialTodos);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

function todoPost(state, action) {
  return new Promise((resolve, reject) => {
    if (!isRequesting) {
      isRequesting = true; // 요청 시작
      console.log("craeting....");
      axios
        .post("http://localhost:8000", action.todo)
        .then((response) => {
          const created = response.data;
          isRequesting = false;
          resolve(state.concat(created));
        })
        .catch((error) => {
          console.error("Error creating data:", error);
          reject("Error creating data:", error);
        });
    }
  });
}

function todoReducer(state, action) {
  switch (action.type) {
    case "CREATE":
      todoPost(state, action).then((data) => {
        console.log(data);
        return data;
      });
    case "TOGGLE":
      const updateTodo = state.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      );
      const updated = updateTodo.find((todo) => todo.id === action.id);
      if (!isRequesting) {
        isRequesting = true; // 요청 시작
        axios
          .put(`http://localhost:8000/api/Plan/${action.id}/`, updated)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.error("Error updating data:", error);
            if (error.response && error.response.data) {
              console.log("Server error response:", error.response.data);
            }
          })
          .finally(() => {
            isRequesting = false; // 요청 종료
          });
      }
      return updateTodo;
    case "REMOVE":
      const removeTodo = state.filter((todo) => todo.id !== action.id);
      if (!isRequesting) {
        isRequesting = true; // 요청 시작
        axios
          .delete(`http://localhost:8000/api/Plan/${action.id}/`)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.error("Error removing data:", error);
            if (error.response && error.response.data) {
              console.log("Server error response:", error.response.data);
            }
          })
          .finally(() => {
            isRequesting = false; // 요청 종료
          });
      }
      return removeTodo;
    default:
      throw new Error("Unhandled action type: &{action.type}");
  }
}

const TodoStateContext = createContext();
const TodoDispatchContext = createContext();

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialTodos);

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

export function useTodoState() {
  const context = useContext(TodoStateContext);

  if (!context) {
    throw new Error("Cannot find TodoProvider");
  }
  return useContext(TodoStateContext);
}

export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (!context) {
    throw new Error("Cannot find TodoProvider");
  }
  return useContext(TodoDispatchContext);
}
