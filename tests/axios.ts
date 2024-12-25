import axios2 from "axios";

const axios = {
  post: async (url: string, ...args: any[]) => {
    try {
      const res = await axios2.post(url, ...args);
      return res;
    } catch (e) {
      if (axios2.isAxiosError(e) && e.response) {
        return e.response;
      }
      throw e;
    }
  },
  get: async (url: string, ...args: any[]) => {
    try {
      const res = await axios2.get(url, ...args);
      return res;
    } catch (e) {
      if (axios2.isAxiosError(e) && e.response) {
        return e.response;
      }
      return e;
    }
  },
  put: async (url: string, ...args: any[]) => {
    try {
      const res = await axios2.put(url, ...args);
      return res;
    } catch (e) {
      if (axios2.isAxiosError(e) && e.response) {
        return e.response;
      }
      return e;
    }
  },
  del: async (url: string, ...args: any[]) => {
    try {
      const res = await axios2.delete(url, ...args);
      return res;
    } catch (e) {
      if (axios2.isAxiosError(e) && e.response) {
        return e.response;
      }
      return e;
    }
  },
};

const { del, get, post, put } = axios;

export { del, get, post, put };
