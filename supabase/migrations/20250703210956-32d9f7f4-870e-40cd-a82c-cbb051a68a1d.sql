
-- Create triggers to automatically update mess budget when expenses are added/updated/deleted

-- Trigger for INSERT: Deduct expense amount from mess budget
CREATE OR REPLACE FUNCTION update_mess_budget_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if hostel_id is not null
  IF NEW.hostel_id IS NOT NULL THEN
    -- Update the remaining budget by subtracting the expense amount
    UPDATE hostels
    SET mess_budget_remaining = mess_budget_remaining - NEW.amount
    WHERE id = NEW.hostel_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for UPDATE: Adjust budget based on difference between old and new amounts
CREATE OR REPLACE FUNCTION update_mess_budget_on_expense_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if hostel_id is not null
  IF NEW.hostel_id IS NOT NULL THEN
    -- If this is an update (not an insert), adjust for the old amount
    IF TG_OP = 'UPDATE' THEN
      -- Add back the old amount and subtract the new amount
      UPDATE hostels
      SET mess_budget_remaining = mess_budget_remaining + OLD.amount - NEW.amount
      WHERE id = NEW.hostel_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for DELETE: Add back the expense amount to mess budget
CREATE OR REPLACE FUNCTION restore_mess_budget_on_expense_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if hostel_id is not null
  IF OLD.hostel_id IS NOT NULL THEN
    -- Add back the deleted expense amount to the budget
    UPDATE hostels
    SET mess_budget_remaining = mess_budget_remaining + OLD.amount
    WHERE id = OLD.hostel_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the actual triggers
DROP TRIGGER IF EXISTS trigger_update_mess_budget_on_insert ON mess_expenses;
CREATE TRIGGER trigger_update_mess_budget_on_insert
  AFTER INSERT ON mess_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_mess_budget_remaining();

DROP TRIGGER IF EXISTS trigger_update_mess_budget_on_update ON mess_expenses;
CREATE TRIGGER trigger_update_mess_budget_on_update
  AFTER UPDATE ON mess_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_mess_budget_on_expense_update();

DROP TRIGGER IF EXISTS trigger_restore_mess_budget_on_delete ON mess_expenses;
CREATE TRIGGER trigger_restore_mess_budget_on_delete
  AFTER DELETE ON mess_expenses
  FOR EACH ROW
  EXECUTE FUNCTION restore_mess_budget_on_expense_delete();
