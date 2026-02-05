export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'teacher' | 'student';
    is_active: boolean;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface Option {
    id: string;
    content: string;
    order: number;
}

export interface Question {
    id: string;
    content: string;
    order: number;
    points: number;
    options: Option[];
}

export interface Exam {
    id: string;
    title: string;
    description?: string;
    time_limit_minutes: number;
    start_date?: string;
    end_date?: string;
    is_published?: boolean;
    question_count?: number;
    questions?: Question[];
}

export interface AttemptStart {
    attempt_id: string;
    exam: Exam;
    server_time: string;
    expires_at: string;
}

export interface Attempt {
    id: string;
    exam_id: string;
    exam_title: string;
    started_at: string;
    submitted_at?: string;
    is_submitted: boolean;
    score?: number;
    max_score?: number;
}

export interface AttemptResult {
    attempt_id: string;
    exam_title: string;
    score: number;
    max_score: number;
    percentage: number;
    started_at: string;
    submitted_at?: string;
    responses: ResponseResult[];
}

export interface ResponseResult {
    question_id: string;
    question_content: string;
    selected_option_id?: string;
    correct_option_id: string;
    is_correct: boolean;
    points_earned: number;
    max_points: number;
}
