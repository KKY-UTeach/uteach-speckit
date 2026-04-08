import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PDFUploader from '../../src/components/PDFUploader';

describe('PDFUploader', () => {
  const mockDocs = [
    { id: '1', name: 'test1.pdf', size: 1024, extractedText: 'text1', timestamp: 123 }
  ];
  const mockOnUpload = vi.fn();
  const mockOnRemove = vi.fn();

  it('renders uploaded documents', () => {
    render(<PDFUploader documents={mockDocs} onUpload={mockOnUpload} onRemove={mockOnRemove} />);
    expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    render(<PDFUploader documents={mockDocs} onUpload={mockOnUpload} onRemove={mockOnRemove} />);
    const removeBtn = screen.getByTitle('Smazat dokument');
    fireEvent.click(removeBtn);
    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('shows upload button when docs count < 3', () => {
    render(<PDFUploader documents={mockDocs} onUpload={mockOnUpload} onRemove={mockOnRemove} />);
    expect(screen.getByText('Přidat PDF dokument')).toBeInTheDocument();
  });

  it('hides upload button when docs count is 3', () => {
    const threeDocs = [
      ...mockDocs,
      { id: '2', name: 'test2.pdf', size: 1024, extractedText: 'text2', timestamp: 124 },
      { id: '3', name: 'test3.pdf', size: 1024, extractedText: 'text3', timestamp: 125 }
    ];
    render(<PDFUploader documents={threeDocs} onUpload={mockOnUpload} onRemove={mockOnRemove} />);
    expect(screen.queryByText('Přidat PDF dokument')).not.toBeInTheDocument();
  });
});
