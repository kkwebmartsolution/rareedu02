-- Add more roles to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- Create authentication functions
CREATE OR REPLACE FUNCTION public.authenticate_user(email_param text, password_param text)
RETURNS TABLE(
    user_id bigint,
    email text,
    first_name text,
    last_name text,
    role user_role,
    is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email::text,
        u.first_name::text,
        u.last_name::text,
        u.role,
        u.is_active
    FROM users u
    WHERE u.email = email_param 
      AND u.password_hash = crypt(password_param, u.password_hash)
      AND u.is_active = true;
END;
$$;

-- Create function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(user_id_param bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_token text;
BEGIN
    -- Generate a random session token
    session_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert session
    INSERT INTO user_sessions (user_id, token, expires_at)
    VALUES (
        user_id_param, 
        session_token, 
        NOW() + INTERVAL '24 hours'
    );
    
    RETURN session_token;
END;
$$;

-- Create function to validate session
CREATE OR REPLACE FUNCTION public.validate_session(token_param text)
RETURNS TABLE(
    user_id bigint,
    email text,
    first_name text,
    last_name text,
    role user_role,
    is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email::text,
        u.first_name::text,
        u.last_name::text,
        u.role,
        u.is_active
    FROM users u
    INNER JOIN user_sessions s ON u.id = s.user_id
    WHERE s.token = token_param 
      AND s.expires_at > NOW()
      AND u.is_active = true;
END;
$$;

-- Create function to logout (invalidate session)
CREATE OR REPLACE FUNCTION public.logout_user(token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM user_sessions WHERE token = token_param;
END;
$$;

-- Create function to create new staff member
CREATE OR REPLACE FUNCTION public.create_staff_member(
    email_param text,
    password_param text,
    first_name_param text,
    last_name_param text,
    role_param user_role,
    agent_name_param text DEFAULT NULL,
    agent_phone_param text DEFAULT NULL,
    agent_location_param text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id bigint;
    password_hash_val text;
BEGIN
    -- Hash the password
    password_hash_val := crypt(password_param, gen_salt('bf'));
    
    -- Insert into users table
    INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
    VALUES (email_param, password_hash_val, first_name_param, last_name_param, role_param, true)
    RETURNING id INTO new_user_id;
    
    -- If role is agent, also add to agents table
    IF role_param = 'agent' THEN
        INSERT INTO agents (name, email, contact_person, phone, location, status)
        VALUES (
            COALESCE(agent_name_param, first_name_param || ' ' || last_name_param),
            email_param,
            first_name_param || ' ' || last_name_param,
            agent_phone_param,
            agent_location_param,
            'Active'
        );
    END IF;
    
    RETURN new_user_id;
END;
$$;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (id = (SELECT user_id FROM user_sessions WHERE token = current_setting('app.session_token', true) AND expires_at > NOW() LIMIT 1));

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        INNER JOIN user_sessions s ON u.id = s.user_id 
        WHERE s.token = current_setting('app.session_token', true) 
          AND s.expires_at > NOW() 
          AND u.role = 'admin'
    )
);

CREATE POLICY "Only admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users u 
        INNER JOIN user_sessions s ON u.id = s.user_id 
        WHERE s.token = current_setting('app.session_token', true) 
          AND s.expires_at > NOW() 
          AND u.role = 'admin'
    )
);

CREATE POLICY "Only admins can update users" 
ON public.users 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        INNER JOIN user_sessions s ON u.id = s.user_id 
        WHERE s.token = current_setting('app.session_token', true) 
          AND s.expires_at > NOW() 
          AND u.role = 'admin'
    )
);

-- Clean up expired sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$;