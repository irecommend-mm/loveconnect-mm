
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram, Music, Mic, Upload } from 'lucide-react';
import { useSocialIntegration } from '@/hooks/useSocialIntegration';

interface SocialIntegrationPanelProps {
  currentProfile?: any;
}

export const SocialIntegrationPanel = ({ currentProfile }: SocialIntegrationPanelProps) => {
  const [instagramUsername, setInstagramUsername] = useState(currentProfile?.instagram_username || '');
  const { connectInstagram, connectSpotify, uploadVoiceIntro, loading } = useSocialIntegration();

  const handleVoiceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadVoiceIntro(file);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="instagram">Instagram Username</Label>
            <div className="flex gap-2">
              <Input
                id="instagram"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="@yourusername"
                className="flex-1"
              />
              <Button 
                onClick={() => connectInstagram(instagramUsername)}
                disabled={!instagramUsername || loading}
              >
                Connect
              </Button>
            </div>
          </div>
          {currentProfile?.instagram_username && (
            <p className="text-sm text-green-600">✓ Connected: @{currentProfile.instagram_username}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentProfile?.spotify_connected ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600">✓ Spotify Connected</p>
              {currentProfile.spotify_data?.topArtists && (
                <div>
                  <p className="text-sm font-medium">Top Artists:</p>
                  <p className="text-xs text-gray-600">
                    {currentProfile.spotify_data.topArtists.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={connectSpotify} disabled={loading}>
              Connect Spotify
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Introduction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentProfile?.voice_intro_url ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600">✓ Voice intro uploaded</p>
              <audio controls className="w-full">
                <source src={currentProfile.voice_intro_url} type="audio/mpeg" />
              </audio>
            </div>
          ) : (
            <div>
              <Label htmlFor="voice-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload voice intro</p>
                  <p className="text-xs text-gray-500">Max 30 seconds, MP3/WAV</p>
                </div>
              </Label>
              <input
                id="voice-upload"
                type="file"
                accept="audio/*"
                onChange={handleVoiceUpload}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
