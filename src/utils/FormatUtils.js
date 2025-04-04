export class FormatUtils {
  static toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(v => FormatUtils.toCamelCase(v));
    } 
    
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = FormatUtils.toCamelCase(obj[key]);
      return acc;
    }, {});
  }
}
