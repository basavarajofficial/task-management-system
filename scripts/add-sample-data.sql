-- Add some sample data for testing
-- First, let's add a sample admin user (you can replace with your actual email)
INSERT INTO users (id, name, email, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@example.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'John Doe', 'john@example.com', 'user'),
  ('00000000-0000-0000-0000-000000000003', 'Jane Smith', 'jane@example.com', 'user')
ON CONFLICT (id) DO NOTHING;

-- Add some sample tasks
INSERT INTO tasks (id, title, description, status, due_date, assigned_to) VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Setup Project Environment', 'Configure development environment and install dependencies', 'completed', '2024-01-15', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'Design Database Schema', 'Create database tables and relationships', 'in_progress', '2024-01-20', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003', 'Implement User Authentication', 'Add login and registration functionality', 'pending', '2024-01-25', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000004', 'Create Task Management UI', 'Build user interface for task management', 'pending', '2024-01-30', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000005', 'Add File Upload Feature', 'Implement proof submission with image upload', 'pending', '2024-02-05', NULL)
ON CONFLICT (id) DO NOTHING;

-- Add some sample task proofs
INSERT INTO task_proofs (task_id, user_id, notes, image_url) VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Environment setup completed successfully. All dependencies installed and tested.', NULL)
ON CONFLICT DO NOTHING;
