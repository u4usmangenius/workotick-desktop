// api.js

import axios from "axios";

const Api = axios.create({
  baseURL: " https://dev.backend.workotick.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 1000 * 60,
});

Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const Get = async (url, params) => {
  try {
    const { data } = await Api.get(url, { params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const Post = async (url, postData) => {
  try {
    const { data } = await Api.post(url, postData);
    return data;
  } catch (error) {
    throw error;
  }
};
