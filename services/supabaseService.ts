import { supabase } from '../lib/supabase';
import { Notice, MaterialData, BatchInfo, GalleryAlbum } from '../types';

interface SiteData {
  notices: Notice[];
  materials_data: MaterialData;
  batch_info: BatchInfo;
  gallery_albums: GalleryAlbum[];
}

const DATA_ID = 'main_config'; // We use a single record to store global state

export const fetchSiteData = async () => {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', DATA_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record doesn't exist, this is fine for first run
        return null;
      }
      throw error;
    }
    return data as SiteData;
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return null;
  }
};

export const saveSiteData = async (siteData: SiteData) => {
  const { error } = await supabase
    .from('site_config')
    .upsert({
      id: DATA_ID,
      ...siteData,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};
