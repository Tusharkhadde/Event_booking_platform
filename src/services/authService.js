import supabase from "./supabaseClient";

export const authService = {
  async signUp({ email, password, name, role = "customer" }) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name, role },
      },
    });

    if (error) throw new Error(error.message);

    // ✅ IMPORTANT: Create profile row instantly
    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          name,
          email: user.email,
          role,
        },
      ]);

      // ✅ ignore duplicate insert error (if already exists)
      if (profileError && profileError.code !== "23505") {
        throw new Error(profileError.message);
      }
    }

    return data;
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;
