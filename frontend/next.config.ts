import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    allowedDevOrigins: [
        "172.168.30.107",
        "172.168.30.107:5006",
        "172.168.30.107:3006",
        "192.168.1.253",
        "192.168.1.253:3006",
        "192.168.1.253:5006"
    ]

};


export default nextConfig;
