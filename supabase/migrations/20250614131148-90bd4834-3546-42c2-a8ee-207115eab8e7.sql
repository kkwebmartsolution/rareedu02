-- Create default admin user for testing
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@rareeducation.com',
    crypt('admin123', gen_salt('bf')),
    'Admin',
    'User',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;