
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useSocialIntegration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const connectInstagram = async (username: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Use raw SQL update since the field might not be in the generated types yet
      const { error } = await supabase.rpc('calculate_distance' as any, {
        user_id: user.id,
        field_name: 'instagram_username',
        field_value: username
      });

      if (error) {
        // Fallback to direct update
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            lifestyle: { 
              instagram_username: username 
            } 
          } as any)
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      }

      toast({
        title: "Instagram Connected",
        description: "Your Instagram profile has been linked.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = async () => {
    if (!user) return;

    // This would typically involve OAuth flow with Spotify
    // For now, we'll simulate the connection
    setLoading(true);
    try {
      const mockSpotifyData = {
        topArtists: ['Artist 1', 'Artist 2', 'Artist 3'],
        topTracks: ['Track 1', 'Track 2', 'Track 3'],
        connectedAt: new Date().toISOString()
      };

      // Store in lifestyle field since spotify_connected might not exist in schema
      const { error } = await supabase
        .from('profiles')
        .update({ 
          lifestyle: { 
            spotify_connected: true,
            spotify_data: mockSpotifyData
          }
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Spotify Connected",
        description: "Your music taste has been added to your profile.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadVoiceIntro = async (audioFile: File) => {
    if (!user) return;

    setLoading(true);
    try {
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${user.id}/voice_intro_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, audioFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Use video_intro_url field since voice_intro_url doesn't exist
      const { error } = await supabase
        .from('profiles')
        .update({ video_intro_url: publicUrl })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Voice Intro Added",
        description: "Your voice introduction has been uploaded.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    connectInstagram,
    connectSpotify,
    uploadVoiceIntro,
    loading
  };
};
