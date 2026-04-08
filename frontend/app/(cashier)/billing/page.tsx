"use client"

import RoleGuard from "@/guards/RoleGuard";

const Dashboard = () => {
    return (
        <>
        <RoleGuard allowedRoles={['BILLINGs']}>
            <div className="text-gray-900 w-full flex justify-center">admin default page</div>
        </RoleGuard>
        </>
    );
}

export default Dashboard;