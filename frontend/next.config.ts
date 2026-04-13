import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    allowedDevOrigins:[
        "172.168.30.107",
        "172.168.30.107:5006",
        "172.168.30.107:3006",
        "192.168.1.124",
        "192.168.1.124:3006",
        "192.168.1.124:5006"
    ]
    
};


export default nextConfig;
