import React from "react";
import { Link } from "react-router-dom";
import { Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileSettings from "@/components/settings/ProfileSettings";

/**
 * Dedicated profile page (linked from sidebar / user menu). Reuses ProfileSettings;
 * use /settings for notifications, appearance, security, and data.
 */
const Profile = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-diamond-100 text-diamond-700 dark:bg-diamond-900/40 dark:text-diamond-300">
            <UserCircle className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Profile
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Manage how you appear in the app, your contact details, and profile
              photo.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to="/settings">
            <Settings className="w-4 h-4 mr-2" aria-hidden />
            All settings
          </Link>
        </Button>
      </div>

      <ProfileSettings />
    </div>
  );
};

export default Profile;
