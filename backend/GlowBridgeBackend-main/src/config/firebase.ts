import * as admin from "firebase-admin";
import { logger } from "../utils/logger";

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App | null = null;

  private constructor() {}

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public initialize(): admin.app.App {
    if (this.app) {
      return this.app;
    }

    try {

      if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        
        const path = require("path");
        const fs = require("fs");

        const credentialsPath = path.resolve(
          process.cwd(),
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        );

        if (!fs.existsSync(credentialsPath)) {
          throw new Error(
            `Firebase credentials file not found at: ${credentialsPath}`
          );
        }

        const serviceAccount = JSON.parse(
          fs.readFileSync(credentialsPath, "utf8")
        );
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } else if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } else {
        
        this.app = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }

      logger.info("Firebase Admin SDK initialized successfully");
      return this.app;
    } catch (error) {
      logger.error("Failed to initialize Firebase Admin SDK:", error);
      throw new Error("Firebase initialization failed");
    }
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      return this.initialize();
    }
    return this.app;
  }

  public getAuth(): admin.auth.Auth {
    return this.getApp().auth();
  }
}

export const firebaseConfig = FirebaseConfig.getInstance();
export const firebaseAuth = () => firebaseConfig.getAuth();
