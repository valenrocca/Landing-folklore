module.exports = function handler(_req, res) {
  res.status(200).json({
    ok: true,
    env: {
      supabaseUrl: Boolean(process.env.SUPABASE_URL?.trim()),
      supabaseAnonKey: Boolean(
        process.env.SUPABASE_ANON_KEY?.trim() ||
          process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
      ),
      typeformToken: Boolean(process.env.TYPEFORM_API_TOKEN?.trim()),
      typeformFormId: Boolean(
        (process.env.TYPEFORM_FORM_ID || 'DxHVf2L2').trim()
      ),
    },
  });
};
