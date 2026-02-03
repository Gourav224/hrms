import type { SWRConfiguration } from "swr";

import { fetcher } from "./fetcher";
import { getErrorMessage } from "./handlers";

export const swrConfig: SWRConfiguration = {
  fetcher,
  onError: (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(getErrorMessage(error));
    }
  },
};
