/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { WarpcastUser } from '@tap/common';

export const Profile = ({ profile }: { profile: WarpcastUser }) => {

  return (
    <div className={`p-4 rounded-lg max-w-xs shadow-lg overflow-hidden text-black dark:text-white`}> 
      <div className="flex items-center space-x-3">
        <img
          src={profile.pfp.url}
          alt={profile.username}
          className="size-12 rounded-full border border-gray-600"
        />
        <div className="truncate">
          <p className={`font-semibold text-lg truncate`}>{profile.displayName}</p>
          <p className={`text-sm truncate`}>@{profile.username}</p>
        </div>
      </div>
      <div className="flex mt-3 space-x-4 items-center">
        <p className={`text-sm`}>{profile.followingCount.toLocaleString()} Following</p>
        <p className={`text-sm`}>{profile.followerCount.toLocaleString()} Followers</p>
        {profile.profile?.location?.description && (
          <p className={`text-sm`}>{profile.profile.location.description}</p>
        )}
      </div>
    </div>
  );
};