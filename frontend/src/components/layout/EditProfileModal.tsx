import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();

  const initialUsername = user?.username ?? user?.email?.split("@")[0] ?? "";

  const [username, setUsername] = useState(initialUsername);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatarUrl = user?.avatar_url ?? null;
  const displayAvatar = avatarPreview ?? currentAvatarUrl;
  const initials = (user?.username ?? user?.email ?? "?")[0].toUpperCase();

  const isDirty =
    username !== initialUsername || avatarFile !== null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!isDirty) return;
    setError(null);
    setSaving(true);
    try {
      await updateProfile(username, avatarFile);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to update profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setUsername(initialUsername);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md border border-white/10 bg-[oklch(0.12_0.01_280)] text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 bg-primary/20 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Change avatar"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
                  {initials}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Click to upload · JPEG, PNG, GIF, WebP · max 5 MB
            </p>
            {avatarFile && (
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Remove new image
              </button>
            )}
          </div>

          {/* Username input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="text-sm">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              placeholder="Enter username"
              className="border-white/10 bg-white/5"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">{username.length}/30 characters</p>
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Email</Label>
            <p className="rounded-md border border-white/8 bg-white/5 px-3 py-2 text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
