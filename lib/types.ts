export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_number: string | null;
  created_at: string;
};

export type VehicleStatus = 'available' | 'financed' | 'sold';

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  price: number;
  status: VehicleStatus;
  created_at: string;
};

export type LoanStatus = 'active' | 'completed' | 'defaulted';

export type Loan = {
  id: string;
  customer_id: string;
  vehicle_id: string | null;
  vehicle_price: number;
  deposit: number;
  balance: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  remaining_balance: number;
  status: LoanStatus;
  start_date: string;
  created_at: string;
};

export type Payment = {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  remaining_after: number;
  note: string | null;
  created_at: string;
};

export type LoanWithRelations = Loan & {
  customer?: Customer;
  vehicle?: Vehicle;
};

export type DashboardStats = {
  totalCustomers: number;
  totalVehicles: number;
  activeLoans: number;
  outstandingBalance: number;
};
