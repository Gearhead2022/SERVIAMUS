import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    allowedDevOrigins: [
        "172.168.30.108",
        "172.168.30.108:5006",
        "172.168.30.108:3006",
        "192.168.1.143",
        "192.168.1.143:3006",
        "192.168.1.143:5006"
    ]

};


export default nextConfig;
