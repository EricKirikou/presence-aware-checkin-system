// src/utils/uploadToCloudinary.ts
export const uploadToCloudinary = async (imageBlob: Blob): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', imageBlob);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url || null;
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    return null;
  }
};
