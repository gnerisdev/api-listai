export class FormatUtils {
  static toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(v => FormatUtils.toCamelCase(v));
  
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = FormatUtils.toCamelCase(obj[key]);
      return acc;
    }, {});
  }  

  static toTime(value) {
    if (!value) return '';
    
    try {
      const date = typeof value === 'string'
        ? new Date(`1970-01-01T${value.length === 5 ? value + ':00' : value}`)
        : value;

      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return '';
    }
  }

  static toDate (value) {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
