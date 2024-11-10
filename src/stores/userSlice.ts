// import { StateCreator } from "zustand";

// interface UserState {
//   userName: string;
//   fullName: string;
//   age: number;
//   address: string;
// }

// interface UserAction {
//   setAddress: (address: string) => void;
// }

// export type UserSlice = UserState & UserAction;

// export const createUserSlice: StateCreator<
//   UserSlice,
//   [["zustand/immer", never]],
//   [],
//   UserSlice
// > = (set) => ({
//   address: "",
//   age: 0,
//   fullName: "",
//   userName: "",
//   setAddress: (address) =>
//     set((state) => {
//       state.address = address;
//       state.fullName;
//     }),
// });

// // const useCountStore = create<{ nested: { count: number }; inc: () => void }>((set) => ({
// //     nested: { count: 0 },
// //     inc: () => set((state) => ({
// //         nested:{...state.nested, count: state.nested.count + 1}
// //     }))
// // }))
