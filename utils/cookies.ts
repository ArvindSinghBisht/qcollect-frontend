import Cookies from "js-cookie";

export const saveToken = (token: string) => {
  Cookies.set("token", token, {
    expires: 7,
    sameSite: "lax",
  });
};

export const removeToken = () => {
  Cookies.remove("token");
};

export const getToken = () => {
  return Cookies.get("token");
};
