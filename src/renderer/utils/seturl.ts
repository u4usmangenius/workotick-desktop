export const BaseUrl = (env: string) => {
  return env === "prod"
    ? {
        frontend: "https://app.workotick.com/",
        backend: "https://backend.app.workotick.com",
      }
    : {
        frontend: "https://dev.workotick.com/",
        backend: "https://backend.dev.workotick.com/",
      };
};
