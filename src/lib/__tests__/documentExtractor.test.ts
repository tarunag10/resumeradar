import { getSupportedTypes, groupTextItemsIntoLines, isDOCX, isPDF } from '../documentExtractor';

describe('documentExtractor', () => {
  describe('groupTextItemsIntoLines', () => {
    it('rebuilds lines from positioned fragments', () => {
      const text = groupTextItemsIntoLines([
        { str: 'Senior', transform: [1, 0, 0, 1, 10, 700] },
        { str: 'Engineer', transform: [1, 0, 0, 1, 60, 700] },
        { str: 'Python, SQL', transform: [1, 0, 0, 1, 10, 680] },
        { str: '• Built dashboards', transform: [1, 0, 0, 1, 10, 660] },
      ]);

      expect(text).toBe('Senior Engineer\nPython, SQL\n• Built dashboards');
    });

    it('orders rows top to bottom and fragments left to right', () => {
      const text = groupTextItemsIntoLines([
        { str: 'second', transform: [1, 0, 0, 1, 10, 600] },
        { str: 'right', transform: [1, 0, 0, 1, 80, 700] },
        { str: 'left', transform: [1, 0, 0, 1, 10, 700] },
      ]);

      expect(text).toBe('left right\nsecond');
    });

    it('starts a new line when a wide column gap appears in one row', () => {
      const text = groupTextItemsIntoLines([
        { str: 'Skills', transform: [1, 0, 0, 1, 10, 700] },
        { str: 'Experience', transform: [1, 0, 0, 1, 400, 700] },
      ]);

      expect(text).toBe('Skills\nExperience');
    });

    it('ignores blank fragments and items without positions', () => {
      expect(groupTextItemsIntoLines([{ str: '   ' }, {}])).toBe('');
    });

    it('returns an empty string for no items', () => {
      expect(groupTextItemsIntoLines([])).toBe('');
    });
  });

  describe('file type detection', () => {
    it('detects PDF and DOCX files by extension and type', () => {
      expect(isPDF(new File(['x'], 'resume.PDF', { type: 'application/pdf' }))).toBe(true);
      expect(isPDF(new File(['x'], 'resume.pdf', { type: '' }))).toBe(true);
      expect(isPDF(new File(['x'], 'resume.docx'))).toBe(false);

      expect(
        isDOCX(new File(['x'], 'resume.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }))
      ).toBe(true);
      expect(isDOCX(new File(['x'], 'resume.txt'))).toBe(false);
    });

    it('lists the supported types', () => {
      expect(getSupportedTypes().extensions).toEqual(['.pdf', '.docx']);
    });
  });
});
