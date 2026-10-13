import { api } from "../lib/axios";

export const studentService = {
    getAllStudents: async () => {
        const response = await api.get("/students");
        return response.data;
    },

    createStudent: async (data: {
        name: string;
        email: string;
        phoneNumber: string;
        address: string;
    }) => {
        const response = await api.post("/students", data);
        return response.data;
    },

    updateStudent: async (
        id: number,
        data: {
            name: string;
            email: string;
            phoneNumber: string;
            address: string;
        },
    ) => {
        const response = await api.put(`/students/${id}`, data);
        return response.data;
    },

    deleteStudent: async (id: number) => {
        await api.delete(`/students/${id}`);
    },
};
