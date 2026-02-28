import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  LogOut,
  Loader2,
  Leaf,
  Calendar,
  Edit3,
  Save,
  X,
} from "lucide-react";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  phone: string;
  profilePicture: string;
  location: {
    city: string;
    country: string;
  };
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    username: "",
    phone: "",
    city: "",
    country: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "demo-token-123") {
      // Demo mode fallback
      setUser({
        _id: "demo",
        username: "Testing User",
        email: "testing@agroai.com",
        role: "farmer",
        phone: "",
        profilePicture: "",
        location: { city: "", country: "" },
        createdAt: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getProfile();
      setUser(response.user);
      setEditData({
        username: response.user.username || "",
        phone: response.user.phone || "",
        city: response.user.location?.city || "",
        country: response.user.location?.country || "",
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message || "Please login again",
        variant: "destructive",
      });
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.updateProfile({
        username: editData.username,
        phone: editData.phone,
        location: {
          city: editData.city,
          country: editData.country,
        },
      });
      setUser(response.user);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await api.uploadProfilePicture(file);
      setUser(response.user);
      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.user));
      toast({
        title: "Profile picture updated",
        description: "Your photo has been uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/15 text-red-600 border-red-500/30";
      case "expert":
        return "bg-blue-500/15 text-blue-600 border-blue-500/30";
      default:
        return "bg-green-500/15 text-green-600 border-green-500/30";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3.5 w-3.5" />;
      case "expert":
        return <Leaf className="h-3.5 w-3.5" />;
      default:
        return <User className="h-3.5 w-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ─── Profile Header Card ─────────────────────── */}
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-green-500 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAyIDQgNC0yIDQtNCA0LTQtMi00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>

            <CardContent className="relative pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-28 w-28 rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center shadow-lg overflow-hidden">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Name & Info */}
                <div className="flex-1 text-center sm:text-left sm:pb-1">
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>

                {/* Role Badge & Actions */}
                <div className="flex items-center gap-3 sm:pb-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${getRoleBadgeColor(user.role)}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-1.5"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({
                            username: user.username || "",
                            phone: user.phone || "",
                            city: user.location?.city || "",
                            country: user.location?.country || "",
                          });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─── Left Column: Account Info ─────────────── */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">
                        {user.phone || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">
                        {user.location?.city && user.location?.country
                          ? `${user.location.city}, ${user.location.country}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logout */}
              <Button
                variant="outline"
                className="w-full gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {/* ─── Right Column: Edit Form ───────────────── */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Edit your details below and click Save"
                      : "Click Edit to update your information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profile-username">Username</Label>
                      <Input
                        id="profile-username"
                        type="text"
                        value={isEditing ? editData.username : user.username}
                        onChange={(e) =>
                          setEditData({ ...editData, username: e.target.value })
                        }
                        disabled={!isEditing}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={user.email}
                        disabled
                        className="mt-1.5 opacity-60"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profile-phone">Phone</Label>
                      <Input
                        id="profile-phone"
                        type="tel"
                        value={isEditing ? editData.phone : user.phone || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        placeholder="+92-300-1234567"
                        disabled={!isEditing}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profile-role">Role</Label>
                      <Input
                        id="profile-role"
                        type="text"
                        value={user.role}
                        disabled
                        className="mt-1.5 capitalize opacity-60"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profile-city">City</Label>
                      <Input
                        id="profile-city"
                        type="text"
                        value={
                          isEditing
                            ? editData.city
                            : user.location?.city || ""
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, city: e.target.value })
                        }
                        placeholder="Lahore"
                        disabled={!isEditing}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profile-country">Country</Label>
                      <Input
                        id="profile-country"
                        type="text"
                        value={
                          isEditing
                            ? editData.country
                            : user.location?.country || ""
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, country: e.target.value })
                        }
                        placeholder="Pakistan"
                        disabled={!isEditing}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scan History Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    Recent Scans
                  </CardTitle>
                  <CardDescription>
                    Your latest plant disease detection results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm mb-3">
                      No scans yet. Start scanning plants to see results here.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/scan")}
                      className="gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Scan a Plant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
