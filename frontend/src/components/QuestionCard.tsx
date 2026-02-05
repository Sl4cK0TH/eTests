import { Question } from '../types';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    selectedOptionId: string | null;
    onSelectOption: (questionId: string, optionId: string) => void;
}

export default function QuestionCard({
    question,
    questionNumber,
    selectedOptionId,
    onSelectOption,
}: QuestionCardProps) {
    return (
        <div className="question-card">
            <div className="question-number">
                Question {questionNumber} <span style={{ color: 'var(--color-text-secondary)' }}>({question.points} pts)</span>
            </div>
            <div className="question-text">{question.content}</div>

            <div className="option-list">
                {question.options.map((option) => (
                    <div
                        key={option.id}
                        className={`option ${selectedOptionId === option.id ? 'selected' : ''}`}
                        onClick={() => onSelectOption(question.id, option.id)}
                    >
                        <div className="option-indicator" />
                        <span>{option.content}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
