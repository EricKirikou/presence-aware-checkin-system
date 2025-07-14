import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Stack,
  IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../components/AuthContext";
import DashboardHeader from "../components/DashboardHeader";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role] = useState(user?.role || "");
  const [avatar, setAvatar] = useState<string | null>(user?.profileImage || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error("User ID is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("profileImage", fileInputRef.current.files[0]);
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://attendane-api.onrender.com/api/v1/users/${user._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully!");
      setUser(result.user); // Update the context
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", backgroundColor: "background.default" }}>
      <DashboardHeader />

      <Paper sx={{ p: 4, maxWidth: 500, mx: "auto", textAlign: "center", mt: 4, position: "relative" }}>
        <IconButton onClick={() => navigate("/dashboard")} sx={{ position: "absolute", top: 16, left: 16 }}>
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
          sx={{ width: 100, height: 100, mx: "auto", mb: 2, cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {!avatar && user?.name?.charAt(0)}
        </Avatar>

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
