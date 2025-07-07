-- Create function to reset staff member password
CREATE OR REPLACE FUNCTION public.reset_staff_password(staff_id_param bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    new_password text;
    password_hash_val text;
BEGIN
    -- Generate new random password
    new_password := '';
    FOR i IN 1..12 LOOP
        new_password := new_password || substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*', floor(random() * 70 + 1)::integer, 1);
    END LOOP;
    
    -- Hash the new password
    password_hash_val := crypt(new_password, gen_salt('bf'));
    
    -- Update the user's password
    UPDATE users 
    SET password_hash = password_hash_val, updated_at = CURRENT_TIMESTAMP
    WHERE id = staff_id_param;
    
    -- Return the plain text password for display
    RETURN new_password;
END;
$function$