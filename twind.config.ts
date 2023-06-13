import { defineConfig } from "https://esm.sh/@twind/core@1.1.3";
import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1.1.4";
import presetAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1.0.7";

export default {
  ...defineConfig({
    presets: [
      presetTailwind(),
      presetAutoprefix(),
    ],
    theme: {
      extend: {
        boxShadow: {
          "button":
            "inset 0 -2px 0 0 #cdcde6,inset 0 0 1px 1px #fff,0 1px 2px 1px rgba(30,35,90,0.4)",
        },
      },
    },
  }),
  selfURL: import.meta.url,
};
