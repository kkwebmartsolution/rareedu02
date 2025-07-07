-- Create the trigger to handle approved applications
CREATE TRIGGER move_approved_application_trigger
  AFTER UPDATE ON apply_students
  FOR EACH ROW
  EXECUTE FUNCTION move_approved_application();