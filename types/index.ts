export type Role = 'admin' | 'user'
export type ComputerStatus = 'Available' | 'Assigned' | 'Under Maintenance' | 'Damaged' | 'Retired'
export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed'
export type AssignmentStatus = 'Active' | 'Returned'
export type MessageStatus = 'unread' | 'read'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  created_at: string
}

export interface Computer {
  id: string
  computer_code: string
  computer_name: string
  brand: string
  model: string
  serial_number: string
  processor: string
  ram: string
  storage: string
  operating_system: string
  location: string
  status: ComputerStatus
  created_at: string
  updated_at: string
}

export interface ComputerAssignment {
  id: string
  computer_id: string
  user_id: string
  assigned_date: string
  returned_date: string | null
  status: AssignmentStatus
  remarks: string | null
  created_at: string
  computers?: Computer
  profiles?: Profile
}

export interface Maintenance {
  id: string
  computer_id: string
  issue: string
  description: string
  maintenance_date: string
  status: MaintenanceStatus
  remarks: string | null
  created_at: string
  computers?: Computer
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  status: MessageStatus
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  description: string
  created_at: string
  profiles?: Profile
}
