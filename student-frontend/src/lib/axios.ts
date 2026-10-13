import axios from "axios";

export const api = axios.create({
    baseURL: "http://221.121.4.43:8080/api/v1",
});
