export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber: string;
  gender: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  performedAt?: string;
  durationMinutes?: number;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkoutPayload {
  title: string;
  notes?: string;
  performedAt?: string;
  durationMinutes?: number;
  exercises: Exercise[];
}

export interface UpdateWorkoutPayload {
  title?: string;
  notes?: string;
  performedAt?: string;
  durationMinutes?: number;
  exercises?: Exercise[];
}
