import { create } from "zustand";
import type { Student } from "../types/student";
import { studentService } from "../service/studentService";

interface StoreState {
    students: Student[];
    loading: boolean;

    getAllStudents: () => Promise<void>;
    createStudent: (data: {
        name: string;
        email: string;
        phoneNumber: string;
        address: string;
    }) => Promise<void>;
    updateStudent: (
        id: number,
        data: {
            name: string;
            email: string;
            phoneNumber: string;
            address: string;
        },
    ) => Promise<void>;
    deleteStudent: (id: number) => Promise<void>;
}

export const useStudentStore = create<StoreState>((set) => ({
    students: [],
    loading: false,

    getAllStudents: async () => {
        try {
            const response = await studentService.getAllStudents();
            set({ students: response });
        } catch (error) {
            console.log(error);
        }
    },

    createStudent: async (data) => {
        try {
            await studentService.createStudent(data);
        } catch (error) {
            console.log(error);
        }
    },

    updateStudent: async (id, data) => {
        try {
            await studentService.updateStudent(id, data);
        } catch (error) {
            console.log(error);
        }
    },

    deleteStudent: async (id) => {
        try {
            await studentService.deleteStudent(id);
        } catch (error) {
            console.log(error);
        }
    },
}));
