export function formatMoney(number: number): string {
  return new Intl.NumberFormat().format(number);
}
export function camelCaseToTitle(text: string): string {
    // Insert a space before all uppercase letters
    // Then capitalize the first letter of each word
    return text
        // Add space before uppercase letters
        .replace(/([A-Z])/g, ' $1')
        // Trim any leading/trailing spaces
        .trim()
        // Capitalize the first letter of each word
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
}

export function toTitleCase(str: string): string {
    return str
        .toLowerCase() // Convert the string to lowercase
        .split(" ") // Split the string into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(" "); // Join the words back into a single string
}