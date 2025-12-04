export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export class CookieManager {

  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof window === "undefined") return;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`;

    if (options.expires) {
      let expiresString: string;
      if (typeof options.expires === "number") {

        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        expiresString = date.toUTCString();
      } else {

        expiresString = options.expires.toUTCString();
      }
      cookieString += `; expires=${expiresString}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }


  static get(name: string): string | null {
    if (typeof window === "undefined") return null;

    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }


  static remove(
    name: string,
    options: Pick<CookieOptions, "path" | "domain"> = {}
  ): void {
    if (typeof window === "undefined") return;

    this.set(name, "", {
      ...options,
      expires: new Date(0),
    });
  }


  static getJSON<T>(name: string): T | null {
    const value = this.get(name);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }


  static setJSON(
    name: string,
    value: unknown,
    options: CookieOptions = {}
  ): void {
    this.set(name, JSON.stringify(value), options);
  }


  static exists(name: string): boolean {
    return this.get(name) !== null;
  }


  static getAll(): Record<string, string> {
    if (typeof window === "undefined") return {};

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const [name, ...valueParts] = cookie.split("=");
      if (name && valueParts.length > 0) {
        const value = valueParts.join("=");
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }


  static clearAll(): void {
    if (typeof window === "undefined") return;

    const cookies = this.getAll();
    for (const name in cookies) {
      this.remove(name);

      this.remove(name, { path: "/" });
      this.remove(name, { path: "/", domain: window.location.hostname });
    }
  }
}
export interface UserCookieData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
  salonId: string;
}
export const COOKIE_NAMES = {
  USER_DATA: "glowbridge_user_data",
  AUTH_TOKEN: "glowbridge_auth_token",
  SESSION_ID: "glowbridge_session_id",
} as const;
export class UserCookies {

  static setUserData(userData: UserCookieData, days: number = 30): void {
    CookieManager.setJSON(COOKIE_NAMES.USER_DATA, userData, {
      expires: days,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });
  }


  static getUserData(): UserCookieData | null {
    return CookieManager.getJSON<UserCookieData>(COOKIE_NAMES.USER_DATA);
  }


  static clearUserData(): void {
    CookieManager.remove(COOKIE_NAMES.USER_DATA, { path: "/" });
  }


  static isLoggedIn(): boolean {
    return CookieManager.exists(COOKIE_NAMES.USER_DATA);
  }


  static clearAllUserCookies(): void {
    CookieManager.remove(COOKIE_NAMES.USER_DATA, { path: "/" });
    CookieManager.remove(COOKIE_NAMES.AUTH_TOKEN, { path: "/" });
    CookieManager.remove(COOKIE_NAMES.SESSION_ID, { path: "/" });
  }


  static setAuthToken(token: string, days: number = 30): void {
    CookieManager.set(COOKIE_NAMES.AUTH_TOKEN, token, {
      expires: days,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });
  }


  static getAuthToken(): string | null {
    return CookieManager.get(COOKIE_NAMES.AUTH_TOKEN);
  }
}
