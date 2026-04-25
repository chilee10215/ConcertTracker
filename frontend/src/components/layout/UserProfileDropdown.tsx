import { useState } from "react";
import { ChevronDown, LogOut, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { EditProfileModal } from "./EditProfileModal";

export function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "User";
  const avatarUrl = user?.avatar_url ?? null;
  const initials = displayName[0].toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="User profile menu"
        >
          {/* Avatar */}
          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-primary/20">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-primary">
                {initials}
              </span>
            )}
          </span>

          {/* Name */}
          <span className="hidden text-foreground sm:inline">{displayName}</span>

          {/* Chevron */}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 border border-white/10 bg-[oklch(0.12_0.01_280)] text-foreground"
        >
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="cursor-pointer gap-2 focus:bg-white/8"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator className="border-white/10" />

          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <DropdownMenuSeparator className="border-white/10" />

          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
