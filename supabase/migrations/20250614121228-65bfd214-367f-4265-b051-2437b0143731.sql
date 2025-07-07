-- Fix the function with proper column references
CREATE OR REPLACE FUNCTION update_application_status(
  application_id INTEGER,
  new_status TEXT
) RETURNS TABLE(id INTEGER, status TEXT) AS $$
BEGIN
  -- For approved status, move to students table
  IF new_status = 'approved' THEN
    -- Insert into students table
    INSERT INTO students (
      first_name, last_name, father_name, mother_name, date_of_birth,
      phone_number, email, university_id, course_id, academic_session_id,
      status, city, country, address, aadhaar_number, passport_number,
      twelfth_marks, seat_number, scores, photo_url, passport_copy_url,
      aadhaar_copy_url, twelfth_certificate_url
    )
    SELECT 
      a.first_name, a.last_name, a.father_name, a.mother_name, a.date_of_birth,
      a.phone_number, a.email, a.university_id, a.course_id, a.academic_session_id,
      'active', a.city, a.country, a.address, a.aadhaar_number, a.passport_number,
      a.twelfth_marks, a.seat_number, a.scores, a.photo_url, a.passport_copy_url,
      a.aadhaar_copy_url, a.twelfth_certificate_url
    FROM apply_students a WHERE a.id = application_id;
    
    -- Delete from apply_students
    DELETE FROM apply_students WHERE apply_students.id = application_id;
    
    -- Return empty result since record is moved
    RETURN;
  ELSE
    -- For other statuses, just update
    UPDATE apply_students 
    SET status = new_status, updated_at = now()
    WHERE apply_students.id = application_id;
    
    -- Return the updated record
    RETURN QUERY
    SELECT a.id, a.status 
    FROM apply_students a 
    WHERE a.id = application_id;
  END IF;
END;
$$ LANGUAGE plpgsql;