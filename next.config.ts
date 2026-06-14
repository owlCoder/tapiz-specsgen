import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* Client router cache: ponovne navigacije na već posećene rute su trenutne;
       mutacije i dalje osvežavaju podatke kroz revalidatePath/router.refresh(). */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
