import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    allowedDevOrigins: [
        "192.168.1.163",
        "192.168.1.163:5006",
        "192.168.1.163:3006",
        "192.168.1.250",
        "192.168.1.250:5006",
        "192.168.1.250:3006",
        "192.168.1.251",
        "192.168.1.251:5006",
        "192.168.1.251:3006",
    ]

};


export default nextConfig;
