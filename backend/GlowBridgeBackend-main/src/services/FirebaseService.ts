import { firebaseAuth } from "../config/firebase";
import { logger } from "../utils/logger";
import { ValidationError, ConflictError } from "../utils/errors";

export interface FirebaseUserData {
  email: string;
  displayName?: string;
  phoneNumber?: string;
  disabled?: boolean;
}

export interface CreateFirebaseUserInput {
  email: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  password?: string; 
}

export class FirebaseService {
  private auth = firebaseAuth();

  async createUser(input: CreateFirebaseUserInput): Promise<string> {
    try {
      const userData: any = {
        email: input.email,
        displayName: `${input.firstName} ${input.lastName}`,
        disabled: false,
      };

      if (input.contactNumber && this.isValidPhoneNumber(input.contactNumber)) {
        userData.phoneNumber = input.contactNumber;
      }

      if (input.password) {
        userData.password = input.password;
      }

      const userRecord = await this.auth.createUser(userData);

      logger.info(
        `Firebase user created successfully with UID: ${userRecord.uid}`
      );
      return userRecord.uid;
    } catch (error: any) {
      logger.error("Failed to create Firebase user:", error);

      if (error.code === "auth/email-already-exists") {
        throw new ConflictError("Email already exists in Firebase");
      } else if (error.code === "auth/invalid-email") {
        throw new ValidationError("Invalid email format");
      } else if (error.code === "auth/weak-password") {
        throw new ValidationError("Password is too weak");
      }

      throw new Error(`Failed to create Firebase user: ${error.message}`);
    }
  }

  async updateUser(
    uid: string,
    updates: Partial<FirebaseUserData>
  ): Promise<void> {
    try {
      await this.auth.updateUser(uid, updates);
      logger.info(`Firebase user updated successfully: ${uid}`);
    } catch (error: any) {
      logger.error(`Failed to update Firebase user ${uid}:`, error);

      if (error.code === "auth/user-not-found") {
        throw new Error("User not found in Firebase");
      } else if (error.code === "auth/email-already-exists") {
        throw new ConflictError("Email already exists in Firebase");
      }

      throw new Error(`Failed to update Firebase user: ${error.message}`);
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await this.auth.deleteUser(uid);
      logger.info(`Firebase user deleted successfully: ${uid}`);
    } catch (error: any) {
      logger.error(`Failed to delete Firebase user ${uid}:`, error);

      if (error.code === "auth/user-not-found") {
        
        logger.info(
          `Firebase user ${uid} was already deleted or doesn't exist`
        );
        return;
      }

      throw new Error(`Failed to delete Firebase user: ${error.message}`);
    }
  }

  async getUserByUid(uid: string): Promise<any> {
    try {
      const userRecord = await this.auth.getUser(uid);
      return userRecord;
    } catch (error: any) {
      logger.error(`Failed to get Firebase user ${uid}:`, error);

      if (error.code === "auth/user-not-found") {
        return null;
      }

      throw new Error(`Failed to get Firebase user: ${error.message}`);
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const userRecord = await this.auth.getUserByEmail(email);
      return userRecord;
    } catch (error: any) {
      logger.error(`Failed to get Firebase user by email ${email}:`, error);

      if (error.code === "auth/user-not-found") {
        return null;
      }

      throw new Error(`Failed to get Firebase user by email: ${error.message}`);
    }
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const link = await this.auth.generatePasswordResetLink(email);
      logger.info(`Password reset link generated for: ${email}`);
      return link;
    } catch (error: any) {
      logger.error(
        `Failed to generate password reset link for ${email}:`,
        error
      );

      if (error.code === "auth/user-not-found") {
        throw new Error("User not found in Firebase");
      }

      throw new Error(
        `Failed to generate password reset link: ${error.message}`
      );
    }
  }

  async disableUser(uid: string): Promise<void> {
    try {
      await this.auth.updateUser(uid, { disabled: true });
      logger.info(`Firebase user disabled: ${uid}`);
    } catch (error: any) {
      logger.error(`Failed to disable Firebase user ${uid}:`, error);
      throw new Error(`Failed to disable Firebase user: ${error.message}`);
    }
  }

  async enableUser(uid: string): Promise<void> {
    try {
      await this.auth.updateUser(uid, { disabled: false });
      logger.info(`Firebase user enabled: ${uid}`);
    } catch (error: any) {
      logger.error(`Failed to enable Firebase user ${uid}:`, error);
      throw new Error(`Failed to enable Firebase user: ${error.message}`);
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }
}
