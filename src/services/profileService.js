import supabase from "./supabaseClient";

export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data; // can be null
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getProfilesByRole(role) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", role)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async uploadAvatar(userId, file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },
};

export default profileService;
