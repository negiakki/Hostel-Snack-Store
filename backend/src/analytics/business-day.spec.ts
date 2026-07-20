import {
  BUSINESS_TIME_ZONE,
  businessDateToString,
  businessDayBounds,
  businessDayFromDateString,
} from './business-day';

describe('business day utilities', () => {
  it('uses Asia/Kolkata midnight boundaries for a requested business date', () => {
    const bounds = businessDayBounds(businessDayFromDateString('2026-07-20'));

    expect(BUSINESS_TIME_ZONE).toBe('Asia/Kolkata');
    expect(bounds).toEqual({
      start: new Date('2026-07-19T18:30:00.000Z'),
      end: new Date('2026-07-20T18:30:00.000Z'),
    });
  });

  it('keeps the YYYY-MM-DD API value as the canonical business-date identifier', () => {
    const businessDate = businessDayFromDateString('2026-01-01');

    expect(businessDateToString(businessDate)).toBe('2026-01-01');
  });
});
