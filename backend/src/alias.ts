import path from "path";
import moduleAlias from "module-alias";

import { ENVIRONMENT } from "./config";

const baseDirectory = path.resolve(__dirname, "..");

// Configure module alias to use @src on imports

if (ENVIRONMENT === "development") {
  moduleAlias.addAliases({
    "@src": baseDirectory + "/src",
  });
} else {
  moduleAlias.addAliases({
    "@src": baseDirectory + "/dist",
  });
}
