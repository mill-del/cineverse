import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } = generateReactHelpers({
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/uploadthing`,
    headers: () => {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`
        };
    }
});