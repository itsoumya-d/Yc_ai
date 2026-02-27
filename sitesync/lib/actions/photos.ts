import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

interface UploadPhotoInput {
  userId: string;
  localUri: string;
  phase: string;
  notes?: string;
  lat?: number;
  lng?: number;
  aiAnalysis?: {
    phase?: string;
    violations?: string[];
    progressNotes?: string;
    confidence?: number;
  } | null;
}

export async function uploadPhoto({
  userId,
  localUri,
  phase,
  notes,
  lat,
  lng,
  aiAnalysis,
}: UploadPhotoInput): Promise<{ data?: { id: string }; error?: string }> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to Supabase Storage
    const fileName = `${userId}/${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("site-photos")
      .upload(fileName, decode(base64), {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("site-photos")
      .getPublicUrl(uploadData.path);

    const photoUrl = urlData.publicUrl;

    // Build AI tags from analysis
    const aiTags: string[] = [];
    if (aiAnalysis?.phase) aiTags.push(aiAnalysis.phase);
    if (aiAnalysis?.violations && aiAnalysis.violations.length > 0) {
      aiTags.push("safety-violation");
    }

    // Insert into database
    const { data: photoRecord, error: dbError } = await supabase
      .from("site_photos")
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        storage_path: uploadData.path,
        construction_phase: phase,
        notes: notes ?? null,
        gps_lat: lat ?? null,
        gps_lng: lng ?? null,
        has_safety_violation:
          (aiAnalysis?.violations?.length ?? 0) > 0,
        ai_tags: aiTags.length > 0 ? aiTags : null,
        ai_description: aiAnalysis?.progressNotes ?? null,
        captured_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (dbError) {
      return { error: dbError.message };
    }

    return { data: { id: photoRecord.id } };
  } catch (err) {
    const error = err as Error;
    return { error: error.message ?? "Upload failed" };
  }
}

export async function getPhotos(userId: string, siteId?: string) {
  let query = supabase
    .from("site_photos")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { data, error } = await query;
  return { data, error: error?.message };
}

export async function deletePhoto(photoId: string, storagePath: string) {
  // Delete from storage
  await supabase.storage.from("site-photos").remove([storagePath]);

  // Delete record
  const { error } = await supabase
    .from("site_photos")
    .delete()
    .eq("id", photoId);

  return { error: error?.message };
}
