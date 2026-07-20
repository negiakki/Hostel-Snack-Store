import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const BUSINESS_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Asia/Kolkata does not observe daylight saving time.
const IST_OFFSET_MILLISECONDS = 5.5 * 60 * 60 * 1000;

export const BUSINESS_TIME_ZONE = 'Asia/Kolkata';

export function currentBusinessDate(now = new Date()): Date {
  const istDate = new Date(now.getTime() + IST_OFFSET_MILLISECONDS);

  return businessDayFromDateString(istDate.toISOString().slice(0, 10));
}

export function businessDayFromDateString(value: string): Date {
  if (!BUSINESS_DATE_PATTERN.test(value)) {
    throw new BadRequestException({
      success: false,
      message: 'Business date must use YYYY-MM-DD format.',
    });
  }

  const businessDay = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(businessDay.getTime()) ||
    businessDay.toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequestException({
      success: false,
      message: 'Business date must be a valid calendar date.',
    });
  }

  return businessDay;
}

export function businessDateToString(businessDate: Date): string {
  return businessDate.toISOString().slice(0, 10);
}

export function businessDayBounds(businessDate: Date): {
  start: Date;
  end: Date;
} {
  const istMidnightAsUtc = Date.UTC(
    businessDate.getUTCFullYear(),
    businessDate.getUTCMonth(),
    businessDate.getUTCDate(),
  );
  const start = new Date(istMidnightAsUtc - IST_OFFSET_MILLISECONDS);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

@Injectable()
export class BusinessDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    return businessDayFromDateString(value);
  }
}
