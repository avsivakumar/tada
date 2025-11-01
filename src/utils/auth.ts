// Simple encryption/decryption using base64 encoding
// For production, consider using a more robust encryption library

interface UserData {
  email: string;
  password: string;
}

const STORAGE_KEY = 'tada_user_auth';
const SESSION_KEY = 'tada_session_active';
const ENCRYPTION_KEY = 'tada_secret_key_2024';

// Simple XOR encryption
function encrypt(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result);
}

function decrypt(encrypted: string): string {
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return result;
}

export function saveUser(email: string, password: string): void {
  const userData: UserData = { email, password };
  const encrypted = encrypt(JSON.stringify(userData));
  localStorage.setItem(STORAGE_KEY, encrypted);
  localStorage.setItem(SESSION_KEY, 'true');
}

export function getUser(): UserData | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  
  try {
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function getRegisteredUserEmail(): string | null {
  const user = getUser();
  return user ? user.email : null;
}

export function verifyPassword(inputPassword: string): boolean {
  const user = getUser();
  if (!user) return false;
  
  const isValid = user.password === inputPassword;
  if (isValid) {
    localStorage.setItem(SESSION_KEY, 'true');
  }
  return isValid;
}

export function isSessionActive(): boolean {
  return localStorage.getItem(SESSION_KEY) === 'true';
}

export function clearUser(): void {
  // Only clear the session, keep user data for future logins
  localStorage.removeItem(SESSION_KEY);
}
