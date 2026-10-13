import { packagesContext } from "~/context";
import { loadPackages } from "~/translit-logic/package";
import builtin from "../translit-logic/builtin.json";
import type { RouterContextProvider } from "react-router";

export const packagesMiddleware = ({ context }: { context: Readonly<RouterContextProvider> }) => {
  context.set(packagesContext, loadPackages([builtin]));
};
