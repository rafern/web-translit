import { createContext } from "react-router";
import { type TranslitPackagesState } from "./translit-logic/package";

export const packagesContext = createContext<TranslitPackagesState>();
