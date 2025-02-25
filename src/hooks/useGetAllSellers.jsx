import { getAllSellers } from "../utils/aptos";
import { useEffect, useState } from "react";

export const useGetAllSellers = () => {
  const [sellers, setSellers] = useState();

  useEffect(() => {
    console.log("Inside useGetAllSellers");
    getAllSellers().then((res) => {
      setSellers(res);
    });
  }, []);
  return sellers;
};
