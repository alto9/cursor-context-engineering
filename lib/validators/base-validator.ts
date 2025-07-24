export abstract class BaseValidator {
  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  protected validateNumericField(value: any, fieldName: string): number | null {
    if (value === null || value === undefined || value === '' || value === 'None' || value === 'N/A') {
      return null;
    }

    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }

    if (typeof value === 'string') {
      // Remove common formatting characters
      const cleanValue = value.replace(/[,$%]/g, '');
      const numValue = parseFloat(cleanValue);
      
      if (isNaN(numValue)) {
        console.warn(`Invalid numeric value for field ${fieldName}: ${value}`);
        return null;
      }
      
      return numValue;
    }

    console.warn(`Unexpected value type for numeric field ${fieldName}: ${typeof value}`);
    return null;
  }

  protected validateDateField(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '' || value === 'None' || value === 'N/A') {
      return null;
    }

    if (typeof value !== 'string') {
      console.warn(`Date field ${fieldName} expected string, got ${typeof value}`);
      return null;
    }

    // Validate date format and create Date object to check validity
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value for field ${fieldName}: ${value}`);
      return null;
    }

    return value;
  }

  protected validateStringField(value: any, fieldName: string, required: boolean = false): string | null {
    if (value === null || value === undefined || value === '' || value === 'None' || value === 'N/A') {
      if (required) {
        throw new Error(`Required string field ${fieldName} is missing or empty`);
      }
      return null;
    }

    if (typeof value !== 'string') {
      console.warn(`String field ${fieldName} expected string, got ${typeof value}`);
      return String(value);
    }

    return value.trim();
  }

  protected validateArrayField(value: any, fieldName: string): any[] {
    if (!Array.isArray(value)) {
      console.warn(`Array field ${fieldName} expected array, got ${typeof value}`);
      return [];
    }
    return value;
  }

  protected validateObjectField(value: any, fieldName: string): any | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== 'object') {
      console.warn(`Object field ${fieldName} expected object, got ${typeof value}`);
      return null;
    }

    return value;
  }

  protected logValidationWarning(fieldName: string, originalValue: any, transformedValue: any): void {
    console.warn(`Field ${fieldName} transformed from ${originalValue} to ${transformedValue}`);
  }

  protected validateEnumField(value: any, fieldName: string, validValues: string[]): string | null {
    if (value === null || value === undefined || value === '' || value === 'None' || value === 'N/A') {
      return null;
    }

    const stringValue = String(value).toLowerCase();
    const validValue = validValues.find(v => v.toLowerCase() === stringValue);
    
    if (!validValue) {
      console.warn(`Invalid enum value for field ${fieldName}: ${value}. Valid values: ${validValues.join(', ')}`);
      return null;
    }

    return validValue;
  }

  abstract validate(data: any): any;
} 