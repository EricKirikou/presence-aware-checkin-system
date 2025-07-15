import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../components/AuthContext";
import DashboardHeader from "../components/DashboardHeader";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:10000";

const ProfilePage = () => {
  const { user, setUser, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role] = useState(user?.role || "");
  const [avatar, setAvatar] = useState<string | null>(user?.profileImage || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        return data.secure_url;
      } else {
        console.error("Cloudinary Error:", data);
        toast.error("Image upload failed.");
        return null;
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      toast.error("Error uploading image.");
      return null;
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error("User ID is missing.");
      return;
    }

    setLoading(true);
    let imageUrl = avatar;

    if (selectedFile) {
      const uploaded = await uploadToCloudinary(selectedFile);
      if (!uploaded) {
        setLoading(false);
        return;
      }
      imageUrl = uploaded;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          profileImage: imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully!");
      setUser(result.user);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(user?.role === "admin" ? "/dashboard" : "/check-in");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", backgroundColor: "background.default" }}>
      <DashboardHeader />

      <Paper sx={{ p: 4, maxWidth: 500, mx: "auto", textAlign: "center", mt: 4, position: "relative" }}>
        <IconButton onClick={handleBack} sx={{ position: "absolute", top: 16, left: 16 }}>
          <ArrowBackIcon />
        </IconButton>

        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageUpload}
        />

        <Avatar
          src={avatar || ""}
          sx={{ width: 100, height: 100, mx: "auto", mb: 1, cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {!avatar && user?.name?.charAt(0)}
        </Avatar>

        <Chip
          label={role.toUpperCase()}
          color={role === 'admin' ? 'primary' : 'default'}
          size="small"
          sx={{ mb: 2 }}
        />

        <Stack spacing={2}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Role"
            value={role}
            disabled
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            fullWidth
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
